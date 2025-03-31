import { getOrCreateCollection } from "@/lib/chromadb/chroma-client";
import { getErrorMessage } from "../error-utils";
import {
  getRepositoryDiscussionsCount,
  getRepositoryFileCount,
} from "../supabase/repos-service";

export interface CollectionIntegrity {
  supabaseCount: number;
  chromaCount: number;
  uniqueChromaCount: number;
  collectionExists: boolean;
  isIntact: boolean;
}

export interface RepositoryIntegrityResult {
  repositoryId: string;
  code: CollectionIntegrity;
  discussions: CollectionIntegrity;
  overallIntegrity: boolean;
  timestamp: string;
  error?: string;
}

/**
 * Checks the integrity of a repository's code collection
 */
export async function checkCodeIntegrity(
  repositoryId: string
): Promise<CollectionIntegrity> {
  const codeCollectionId = `repo_${repositoryId}_code`;
  let fileCount;
  try {
    fileCount = await getRepositoryFileCount(repositoryId);
  } catch (error) {
    console.log(`Code files count could not be loaded from supabase: ${error}`);
  }
  let codeCollection;
  let codeChromaCount = 0;
  let codeCollectionExists = false;
  let uniqueCodeFilesInChroma = 0;
  try {
    codeCollection = await getOrCreateCollection(codeCollectionId);
    if (codeCollection) {
      codeCollectionExists = true;
      codeChromaCount = await codeCollection.count();

      const queryResult = await codeCollection.get({
        // @ts-expect-error - "metadatas" is a valid value according to IncludeEnum
        include: ["metadatas"],
      });

      // Count ONLY unique file paths, as there are chunks!
      const uniqueFilePaths = new Set<string>();
      if (queryResult.metadatas && queryResult.metadatas.length > 0) {
        for (const metadata of queryResult.metadatas) {
          if (
            metadata &&
            "path" in metadata &&
            typeof metadata.path === "string"
          ) {
            uniqueFilePaths.add(metadata.path);
          }
        }
      }
      uniqueCodeFilesInChroma = uniqueFilePaths.size;
    }
  } catch (error) {
    console.log(`Code collection ${codeCollectionId} not found: ${error}`);
  }

  return {
    supabaseCount: fileCount || 0,
    chromaCount: codeChromaCount,
    uniqueChromaCount: uniqueCodeFilesInChroma,
    collectionExists: codeCollectionExists,
    isIntact:
      codeCollectionExists && (fileCount || 0) === uniqueCodeFilesInChroma,
  };
}

/**
 * Checks the integrity of a repository's discussions collection
 */
export async function checkDiscussionsIntegrity(
  repositoryId: string
): Promise<CollectionIntegrity> {
  const discussionsCollectionId = `repo_${repositoryId}_discussions`;

  let discussionsCount;
  try {
    discussionsCount = await getRepositoryDiscussionsCount(repositoryId);
  } catch (error) {
    console.log(
      `Discussions count could not be loaded from supabase: ${error}`
    );
  }

  let discussionsCollection;
  let discussionsChromaCount = 0;
  let discussionsCollectionExists = false;
  let uniqueDiscussionsInChroma = 0;

  try {
    discussionsCollection = await getOrCreateCollection(
      discussionsCollectionId
    );
    if (discussionsCollection) {
      discussionsCollectionExists = true;
      discussionsChromaCount = await discussionsCollection.count();

      const queryResult = await discussionsCollection.get({
        // @ts-expect-error - "metadatas" is a valid value according to IncludeEnum
        include: ["metadatas"],
      });

      // Extract discussion paths and count unique ones
      const uniqueDiscussionPaths = new Set<string>();
      if (queryResult.metadatas && queryResult.metadatas.length > 0) {
        for (const metadata of queryResult.metadatas) {
          if (
            metadata &&
            "path" in metadata &&
            typeof metadata.path === "string"
          ) {
            uniqueDiscussionPaths.add(metadata.path);
          }
        }
      }
      uniqueDiscussionsInChroma = uniqueDiscussionPaths.size;
    }
  } catch (error) {
    console.log(
      `Discussions collection ${discussionsCollectionId} not found: ${error}`
    );
  }

  return {
    supabaseCount: discussionsCount || 0,
    chromaCount: discussionsChromaCount,
    uniqueChromaCount: uniqueDiscussionsInChroma,
    collectionExists: discussionsCollectionExists,
    isIntact:
      discussionsCollectionExists &&
      (discussionsCount || 0) === uniqueDiscussionsInChroma,
  };
}

/**
 * Checks the overall data integrity of a repository
 */
export async function checkRepositoryIntegrity(
  repositoryId: string
): Promise<RepositoryIntegrityResult> {
  try {
    const [codeIntegrity, discussionsIntegrity] = await Promise.all([
      checkCodeIntegrity(repositoryId),
      checkDiscussionsIntegrity(repositoryId),
    ]);
    return {
      repositoryId,
      code: codeIntegrity,
      discussions: discussionsIntegrity,
      overallIntegrity: codeIntegrity.isIntact && discussionsIntegrity.isIntact,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error checking repository integrity:", error);
    return {
      repositoryId,
      code: {
        supabaseCount: 0,
        chromaCount: 0,
        uniqueChromaCount: 0,
        collectionExists: false,
        isIntact: false,
      },
      discussions: {
        supabaseCount: 0,
        chromaCount: 0,
        uniqueChromaCount: 0,
        collectionExists: false,
        isIntact: false,
      },
      overallIntegrity: false,
      timestamp: new Date().toISOString(),
      error: getErrorMessage(error),
    };
  }
}
