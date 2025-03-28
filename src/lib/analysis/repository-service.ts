import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateCollection } from "../chromadb/chroma-client";
import { Octokit } from "@octokit/rest";
import { Repository, FileContent } from "@/types/repository";
import { createFileMetadata } from "@/types/chromadb";
import { glob } from "glob";
import { BATCH_SIZE, CHUNK_SIZE } from "@/config/processing";

// Base directory for storing repositories
const REPOS_DIR = path.join(process.cwd(), "tmp", "repos");

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

export async function cleanupRepository(repoId: string) {
  const repoDir = path.join(REPOS_DIR, repoId);
  try {
    await fs.rm(repoDir, { recursive: true, force: true });
    console.log(`Repository ${repoId} cleaned up successfully`);
    return true;
  } catch (error) {
    console.error(`Error cleaning up repository ${repoId}:`, error);
    return false;
  }
}

/**
 * Extract GitHub repository metadata using Octokit
 */
export async function getRepositoryMetadata(
  repoUrl: string,
  accessToken: string
): Promise<Partial<Repository>> {
  const octokit = new Octokit({ auth: accessToken });

  // Parse the owner and repo from URL
  // Format: https://github.com/owner/repo
  const urlParts = new URL(repoUrl).pathname.split("/").filter(Boolean);
  const owner = urlParts[0];
  const repo = urlParts[1];

  const { data } = await octokit.repos.get({ owner, repo });

  return {
    github_id: data.id,
    owner: data.owner.login,
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    default_branch: data.default_branch,
    is_private: data.private,
    stars_count: data.stargazers_count,
  };
}

/**
 * Process and list all relevant files in the repository
 */
export async function processRepositoryFiles(
  repoDir: string
): Promise<FileContent[]> {
  // Get all files except excluded ones (node_modules, .git, etc.)
  const files = await glob("**/*", {
    cwd: repoDir,
    ignore: [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
    ],
    nodir: true,
  });

  const fileContents: FileContent[] = [];

  // Process each file
  for (const file of files) {
    try {
      const filePath = path.join(repoDir, file);
      const stats = await fs.stat(filePath);

      // Skip files that are too large (e.g., over 1MB)
      if (stats.size > 1024 * 1024) {
        console.log(`Skipping large file: ${file}`);
        continue;
      }

      // Skip binary files
      if (isBinaryPath(file)) {
        console.log(`Skipping binary file: ${file}`);
        continue;
      }

      // Read file content
      const content = await fs.readFile(filePath, "utf-8");

      fileContents.push({
        path: file,
        content,
        language: getLanguageFromPath(file),
        size_bytes: stats.size,
        last_modified: stats.mtime.toISOString(),
      });
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return fileContents;
}

/**
 * Create ChromaDB collection and add file contents
 */
export async function storeInChromaDB(
  repositoryId: string,
  files: FileContent[]
): Promise<string> {
  // Create collection for this repository
  const collectionId = `repo_${repositoryId}`;

  // Get or create the collection using our helper
  const collection = await getOrCreateCollection(collectionId);
  console.log(`Using collection: ${collectionId}`);

  // Process files in batches to avoid overwhelming ChromaDB
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);

    // Split larger files into chunks
    const chunks: {
      ids: string[];
      documents: string[];
      metadatas: Record<string, string | number | boolean>[]; // No null
    } = {
      ids: [],
      documents: [],
      metadatas: [],
    };

    for (const file of batch) {
      // For large files, split them into multiple chunks
      if (file.content.length > CHUNK_SIZE) {
        const fileChunks = splitIntoChunks(file.content, CHUNK_SIZE);

        fileChunks.forEach((chunk, index) => {
          const chunkId = `${repositoryId}_${file.path}_${index}`;
          chunks.ids.push(chunkId);
          chunks.documents.push(chunk);
          chunks.metadatas.push(
            createFileMetadata(repositoryId, file.path, file.language, {
              isChunk: true,
              chunkIndex: index,
              totalChunks: fileChunks.length,
            })
          );
        });
      } else {
        // For smaller files, add them as-is
        const fileId = `${repositoryId}_${file.path}`;
        chunks.ids.push(fileId);
        chunks.documents.push(file.content);
        chunks.metadatas.push(
          createFileMetadata(repositoryId, file.path, file.language)
        );
      }
    }

    if (chunks.ids.length > 0) {
      try {
        await collection.add({
          ids: chunks.ids,
          documents: chunks.documents,
          metadatas: chunks.metadatas,
        });
        console.log(`Added ${chunks.ids.length} chunks to ChromaDB`);
      } catch (error) {
        console.error(`Error adding chunks to ChromaDB:`, error);
        throw error;
      }
    }
  }

  return collectionId;
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
    // Get repository metadata first - we need this to check if it exists
    const metadata = await getRepositoryMetadata(repoUrl, accessToken);

    // Check if the repository already exists
    const { data: existingRepo } = await supabase
      .from("repositories")
      .select("*")
      .eq("github_id", metadata.github_id)
      .single();

    let repository;

    if (existingRepo) {
      // Repository already exists - check if user has access
      const { data: existingUserRepo } = await supabase
        .from("user_repositories")
        .select("id")
        .eq("user_id", userId)
        .eq("repository_id", existingRepo.id)
        .single();

      if (existingUserRepo) {
        // User already has this repository
        console.log("User already has access to this repository");
        return existingRepo;
      } else {
        // Link existing repository to this user
        await supabase.from("user_repositories").insert({
          user_id: userId,
          repository_id: existingRepo.id,
          is_favorite: false,
        });

        repository = existingRepo;
        console.log("Linked existing repository to user");
      }
    } else {
      // Repository doesn't exist, create it
      const { data: newRepository, error: repoError } = await supabase
        .from("repositories")
        .insert({
          ...metadata,
          status: "importing",
          last_analyzed: null,
          error_message: null,
          current_stage: "Initializing repository",
        })
        .select()
        .single();

      if (repoError)
        throw new Error(
          `Failed to create repository record: ${repoError.message}`
        );

      repository = newRepository;

      // Create user_repository relationship
      const { error: userRepoError } = await supabase
        .from("user_repositories")
        .insert({
          user_id: userId,
          repository_id: repository.id,
          is_favorite: false,
        });

      if (userRepoError)
        throw new Error(
          `Failed to create user repository link: ${userRepoError.message}`
        );
    }

    // Local helper function to update the current processing stage
    const updateStage = async (stage: string) => {
      await supabase
        .from("repositories")
        .update({ current_stage: stage })
        .eq("id", repository.id);
    };

    // If repository status is already 'ready', we don't need to process it again
    if (repository.status === "ready") {
      return repository;
    }

    // Update status to 'importing' if it's not already
    if (repository.status !== "importing") {
      await supabase
        .from("repositories")
        .update({
          status: "importing",
          current_stage: "Starting import process",
        })
        .eq("id", repository.id);
    }

    // 3. Clone the repository
    await updateStage("Cloning repository");
    const { repoDir } = await cloneRepository(repoUrl, accessToken);

    try {
      // 4. Update status to 'analyzing'
      await supabase
        .from("repositories")
        .update({
          status: "analyzing",
          current_stage: "Beginning code analysis",
        })
        .eq("id", repository.id);

      // 5. Process repository files
      await updateStage("Processing repository files");
      const files = await processRepositoryFiles(repoDir);

      // 6. Store in ChromaDB
      await updateStage(`Creating vector embeddings for ${files.length} files`);
      const collectionId = await storeInChromaDB(repository.id, files);

      // 7. Store file metadata in Supabase
      await updateStage("Storing file metadata");

      // Clear any existing files first if this is a re-import
      await supabase
        .from("repository_files")
        .delete()
        .eq("repository_id", repository.id);

      for (const file of files) {
        await supabase.from("repository_files").insert({
          repository_id: repository.id,
          path: file.path,
          language: file.language,
          size_bytes: file.size_bytes,
          last_modified: file.last_modified,
          chroma_collection_id: collectionId,
        });
      }

      // 8. Update repository status to 'ready'
      await updateStage("Completing analysis");
      const { data: updatedRepo } = await supabase
        .from("repositories")
        .update({
          status: "ready",
          last_analyzed: new Date().toISOString(),
          current_stage: "Repository analysis complete",
        })
        .eq("id", repository.id)
        .select()
        .single();

      return updatedRepo;
    } catch (error) {
      // If anything fails, update repository status to 'error'
      await supabase
        .from("repositories")
        .update({
          status: "error",
          error_message: error instanceof Error ? error.message : String(error),
          current_stage: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        })
        .eq("id", repository.id);

      throw error;
    } finally {
      // Always clean up the cloned repository
      await cleanupRepository(repoDir);
    }
  } catch (error) {
    console.error("Repository import failed:", error);
    throw error;
  }
}

// Helper functions

function getLanguageFromPath(filePath: string): string | null {
  const extension = path.extname(filePath).toLowerCase();
  const extensionMap: Record<string, string> = {
    ".js": "JavaScript",
    ".jsx": "JavaScript (React)",
    ".ts": "TypeScript",
    ".tsx": "TypeScript (React)",
    ".py": "Python",
    ".rb": "Ruby",
    ".java": "Java",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".md": "Markdown",
    ".json": "JSON",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",
    ".cs": "C#",
    ".cpp": "C++",
    ".c": "C",
    // Add more as needed
  };

  return extensionMap[extension] || null;
}

function isBinaryPath(filePath: string): boolean {
  const binaryExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".ico",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
    ".mp3",
    ".mp4",
    ".wav",
    ".avi",
    ".mov",
    ".sqlite",
    ".db",
  ];

  const extension = path.extname(filePath).toLowerCase();
  return binaryExtensions.includes(extension);
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];

  // Try to split on double newlines to preserve paragraph structure
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      // If paragraph is too big for a single chunk, split it further
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      if (paragraph.length <= chunkSize) {
        currentChunk = paragraph;
      } else {
        // Split long paragraph into smaller chunks
        let remainingText = paragraph;
        while (remainingText) {
          // Try to split on sentence boundaries when possible
          const sentenceMatch = remainingText.match(
            /^([\s\S]{1,}?[.!?])\s+([\s\S]*)$/
          );

          if (sentenceMatch && sentenceMatch[1].length <= chunkSize) {
            chunks.push(sentenceMatch[1]);
            remainingText = sentenceMatch[2];
          } else {
            // Otherwise just take a chunk of the maximum size
            chunks.push(remainingText.slice(0, chunkSize));
            remainingText = remainingText.slice(chunkSize);
          }
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
