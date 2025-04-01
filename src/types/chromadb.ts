export type FileMetadata = Record<string, string | number | boolean>;

// Helper that ensures we never return null values
export function createFileMetadata(
  repositoryId: string,
  path: string,
  language: string | null,
  options?: {
    isChunk?: boolean;
    chunkIndex?: number;
    totalChunks?: number;
  }
): FileMetadata {
  const metadata: FileMetadata = {
    repositoryId,
    path,
    language: language || "unknown",
    isChunk: options?.isChunk || false,
  };

  if (options?.chunkIndex !== undefined) {
    metadata.chunkIndex = options.chunkIndex;
  }

  if (options?.totalChunks !== undefined) {
    metadata.totalChunks = options.totalChunks;
  }

  return metadata;
}

export interface RepositoryQueryResultItem {
  content: string;
  metadata: {
    [key: string]: unknown;
  };
  distance?: number;
  type: "code" | "discussion";
}

export type RepositoryQueryResult = RepositoryQueryResultItem[];
