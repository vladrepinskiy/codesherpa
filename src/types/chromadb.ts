// Match exactly what ChromaDB expects - no null values allowed
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
    language: language || "unknown", // Convert null to string
    isChunk: options?.isChunk || false,
  };

  // Only add these properties if they exist (no nulls allowed)
  if (options?.chunkIndex !== undefined) {
    metadata.chunkIndex = options.chunkIndex;
  }

  if (options?.totalChunks !== undefined) {
    metadata.totalChunks = options.totalChunks;
  }

  return metadata;
}
