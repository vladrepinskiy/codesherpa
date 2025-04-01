import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import AdmZip from "adm-zip";
import { Repository } from "@/types/repository";
import { createClient } from "../supabase/server";
import {
  downloadRepositoryZip,
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
import { isServerlessEnv, storeInChromaDB } from "../chromadb/chroma-client";

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
export async function cloneRepository(repoUrl: string, accessToken: string) {
  const repoId = uuidv4();
  const repoDir = isServerlessEnv
    ? path.join("/tmp", "repos", repoId)
    : path.join(process.cwd(), "tmp", "repos", repoId);
  const zipPath = path.join(repoDir + ".zip");

  try {
    await fs.mkdir(path.dirname(repoDir), { recursive: true });

    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (!urlMatch) {
      throw new Error("Invalid GitHub repository URL");
    }

    const [, owner, repo] = urlMatch;

    await downloadRepositoryZip(owner, repo, accessToken, zipPath);
    await fs.mkdir(repoDir, { recursive: true });
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(repoDir, true);
    console.log(`Repository zip extracted to ${repoDir}`);

    // The extracted content is in a subdirectory, move it up one level
    const files = await fs.readdir(repoDir);
    const extractedDir = path.join(repoDir, files[0]);

    // Move all files from subdirectory to the main repo directory
    const extractedFiles = await fs.readdir(extractedDir);
    for (const file of extractedFiles) {
      const sourcePath = path.join(extractedDir, file);
      const destPath = path.join(repoDir, file);

      const stats = await fs.stat(sourcePath);
      if (stats.isDirectory()) {
        // For directories, create destination directory and copy contents
        await fs.mkdir(destPath, { recursive: true });
        await fs.cp(sourcePath, destPath, { recursive: true });
      } else {
        // For files, just move them
        await fs.rename(sourcePath, destPath);
      }
    }

    await fs.rm(extractedDir, { recursive: true, force: true });
    await fs.unlink(zipPath);
    console.log(
      `Repository downloaded and extracted successfully to ${repoDir}`
    );
    return { repoId, repoDir };
  } catch (error) {
    console.error("Error downloading repository:", error);
    throw new Error(`Failed to download repository: ${error}`);
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
 * Initializes and queues a repository for background import
 * This function handles the quick initialization part that should complete within API time limits
 */
export async function initializeRepositoryImport(
  repoUrl: string,
  accessToken: string,
  userId: string
): Promise<Repository> {
  try {
    const metadata = await getRepositoryMetadata(repoUrl, accessToken);
    let repository = await handleRepositoryCreationInSupabase(userId, metadata);

    // If it's a new repository or not ready, update its status
    if (repository.status !== "ready" && repository.status !== "importing") {
      // Update to queued status
      const supabase = await createClient();
      const { data: updatedRepo, error } = await supabase
        .from("repositories")
        .update({
          status: "queued",
          current_stage: "Waiting in import queue",
        })
        .eq("id", repository.id)
        .select()
        .single();

      if (error) throw error;
      repository = updatedRepo!;
    }

    // Queue the repository for background processing if not already ready
    if (repository.status !== "ready") {
      queueRepositoryImport(repository.id, repoUrl, accessToken, userId);
    }

    return repository;
  } catch (error) {
    console.error("Failed to initialize repository import:", error);
    throw error;
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
  let repository;
  try {
    const metadata = await getRepositoryMetadata(repoUrl, accessToken);
    repository = await handleRepositoryCreationInSupabase(userId, metadata);
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
    await updateStatus("error", repository.id);
    await updateStage(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      repository.id
    );
    console.error("Repository import failed:", error);
    throw error;
  }
}

const processingRepos = new Map<string, boolean>();

export async function queueRepositoryImport(
  repoId: string,
  repoUrl: string,
  accessToken: string,
  userId: string
): Promise<void> {
  if (processingRepos.get(repoId)) {
    return;
  }

  processingRepos.set(repoId, true);

  // Don't await this - it runs independently of the HTTP response
  processRepositoryImport(repoId, repoUrl, accessToken, userId)
    .catch((error) => {
      console.error(`Background import failed for ${repoId}:`, error);
    })
    .finally(() => {
      processingRepos.delete(repoId);
    });
}

async function processRepositoryImport(
  repoId: string,
  repoUrl: string,
  accessToken: string,
  userId: string
): Promise<void> {
  try {
    // Perform the actual import
    await importRepository(repoUrl, accessToken, userId);
  } catch (error) {
    // Update status to error if something fails
    const supabase = await createClient();
    await supabase
      .from("repositories")
      .update({
        status: "error",
        error_message: error instanceof Error ? error.message : String(error),
        current_stage: "Import failed",
      })
      .eq("id", repoId);

    throw error;
  }
}
