import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Base directory for storing repositories
const REPOS_DIR = path.join(process.cwd(), "tmp", "repos");

export async function cloneRepository(repoUrl: string, accessToken?: string) {
  // Create a unique directory for this repository clone
  const repoId = uuidv4();
  const repoDir = path.join(REPOS_DIR, repoId);

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(REPOS_DIR, { recursive: true });

    // Prepare the git URL with token if provided
    let gitUrl = repoUrl;
    if (accessToken) {
      // Format: https://{token}@github.com/username/repo.git
      const urlObj = new URL(repoUrl);
      urlObj.username = accessToken;
      gitUrl = urlObj.toString();
    }

    // Clone the repository
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
