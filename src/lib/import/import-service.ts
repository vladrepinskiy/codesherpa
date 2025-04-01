import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import simpleGit from "simple-git";
import { Repository } from "@/types/repository";
import { createClient } from "../supabase/server";
import {
  fetchRepositoryDiscussions,
  getRepositoryMetadata,
} from "../github/github-client";
import {
  addUserRepository,
  checkRepositoryAccess,
} from "../supabase/user-service";
import {
  cleanRepositoryFiles,
  createRepository,
  updateStage,
  updateStatus,
} from "../supabase/repos-service";
import { processRepositoryFiles } from "./file-utils";
import { storeInChromaDB } from "../chromadb/chroma-client";

// Base directory for storing repositories, adapted to vercel /tmp dir
const REPOS_DIR = process.env.VERCEL
  ? path.join("/tmp", "repos")
  : path.join(process.cwd(), "tmp", "repos");

/**
 * Creates a repository in supabase, or handles the retrieval of the existing one
 */
async function handleRepositoryCreationInSupabase(
  userId: string,
  metadata: Partial<Repository>
) {
  const supabase = await createClient();
  const { data: existingRepo } = await supabase
    .from("repositories")
    .select("*")
    .eq("github_id", metadata.github_id)
    .single();

  let repository;

  if (existingRepo) {
    const existingUserRepo = await checkRepositoryAccess(
      existingRepo.id,
      userId
    );
    if (!(existingUserRepo instanceof Response)) {
      console.log(`User already has access to repository ${metadata.name}`);
      return existingRepo;
    } else {
      await addUserRepository(userId, existingRepo.id);
      repository = existingRepo;
      console.log("Linked existing repository to user");
    }
  } else {
    const { repository: newRepo } = await createRepository(metadata);
    repository = newRepo!;
    await addUserRepository(userId, repository.id);
  }

  return repository;
}

/**
 * Clones a repository to a local directory
 */
export async function cloneRepository(repoUrl: string, accessToken?: string) {
  const repoId = uuidv4();
  const repoDir = path.join(REPOS_DIR, repoId);

  try {
    await fs.mkdir(REPOS_DIR, { recursive: true });

    let gitUrl = repoUrl;
    if (accessToken) {
      if (!repoUrl.endsWith(".git")) {
        repoUrl = `${repoUrl}.git`;
      }

      // Format for GitHub: https://{token}@github.com/username/repo.git
      const urlParts = repoUrl.split("//");
      gitUrl = `${urlParts[0]}//${accessToken}@${urlParts[1]}`;

      console.log(`Using authenticated URL (token hidden)`);
    }

    const git = simpleGit();
    await git.clone(gitUrl, repoDir);

    console.log(`Repository cloned successfully to ${repoDir}`);
    return { repoId, repoDir };
  } catch (error) {
    console.error("Error cloning repository:", error);
    throw new Error(`Failed to clone repository: ${error}`);
  }
}

/**
 * Cleans up a repository directory
 */
export async function cleanupRepository(repoPath: string) {
  try {
    await fs.rm(repoPath, { recursive: true, force: true });
    console.log(`Repository at ${repoPath} cleaned up successfully`);
    return true;
  } catch (error) {
    console.error(`Error cleaning up repository at ${repoPath}:`, error);
    return false;
  }
}

/**
 * Main function to import a repository
 */
export async function importRepository(
  repoUrl: string,
  accessToken: string,
  userId: string
): Promise<Repository> {
  const supabase = await createClient();
  try {
    const metadata = await getRepositoryMetadata(repoUrl, accessToken);
    const repository = await handleRepositoryCreationInSupabase(
      userId,
      metadata
    );
    if (repository.status === "ready") {
      return repository;
    }
    if (repository.status !== "importing") {
      await updateStatus("importing", repository.id);
    }
    await updateStage("Cloning repository", repository.id);
    const { repoDir } = await cloneRepository(repoUrl, accessToken);

    try {
      await updateStage("Processing repository files", repository.id);
      const files = await processRepositoryFiles(repoDir);
      await updateStage(
        `Creating vector embeddings for ${files.length} files`,
        repository.id
      );
      const collectionId = await storeInChromaDB(repository.id, files, "code");
      await updateStage("Storing file metadata", repository.id);
      await cleanRepositoryFiles(repository.id);

      for (const file of files) {
        // TODO: bulk create
        await supabase.from("repository_files").insert({
          repository_id: repository.id,
          path: file.path,
          language: file.language,
          size_bytes: file.size_bytes,
          last_modified: file.last_modified,
          chroma_collection_id: collectionId,
        });
      }

      await updateStage(
        "Fetching repository discussions and PRs",
        repository.id
      );
      const discussions = await fetchRepositoryDiscussions(
        metadata.owner as string,
        metadata.name as string,
        accessToken
      );
      const discussionContents = discussions.map((d) => ({
        path: `${d.type}/${d.number}`,
        content: `# ${d.title}\n\n${d.body}\n\nURL: ${d.url}\nAuthor: ${d.author}\nCreated: ${d.createdAt}`,
        language: "markdown",
        size_bytes: d.body.length + d.title.length,
        last_modified: d.createdAt,
      }));
      await updateStage(
        `Creating vector embeddings for ${discussions.length} discussions`,
        repository.id
      );
      const discussionsCollectionId = await storeInChromaDB(
        repository.id,
        discussionContents,
        "discussions"
      );
      await updateStage("Storing discussion metadata", repository.id);
      for (const discussion of discussions) {
        // TODO: bulk create
        await supabase.from("repository_discussions").insert({
          repository_id: repository.id,
          external_id: discussion.id,
          title: discussion.title,
          type: discussion.type,
          number: discussion.number,
          url: discussion.url,
          author: discussion.author,
          created_at: discussion.createdAt,
          chroma_collection_id: discussionsCollectionId,
        });
      }
      await updateStage("Completing analysis", repository.id);
      const updatedRepo = await updateStatus("ready", repository.id);
      return updatedRepo;
    } catch (error) {
      await updateStatus("error", repository.id);
      await updateStage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        repository.id
      );
      throw error;
    } finally {
      await cleanupRepository(repoDir);
    }
  } catch (error) {
    console.error("Repository import failed:", error);
    throw error;
  }
}
