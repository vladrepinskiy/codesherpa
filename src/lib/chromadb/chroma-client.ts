import {
  createFileMetadata,
  RepositoryQueryResult,
  RepositoryQueryResultItem,
} from "@/types/chromadb";
import { FileContent } from "@/types/repository";
import { ChromaClient, Collection } from "chromadb";
import { BATCH_SIZE, CHUNK_SIZE } from "@/config/processing";
import { splitIntoChunks } from "./chunks-utils";

let chromaClient: ChromaClient | null = null;

export async function getChromaClient(): Promise<ChromaClient> {
  if (!chromaClient) {
    const chromaUrl = process.env.CHROMA_DB_URL || "http://chromadb:8000";
    console.log(`Attempting to connect to ChromaDB at: ${chromaUrl}`);
    chromaClient = new ChromaClient({
      path: chromaUrl,
    });
  }
  return chromaClient;
}

export async function getOrCreateCollection(
  collectionId: string
): Promise<Collection> {
  const chromaClient = await getChromaClient();
  try {
    // Get collection without specifying an embedding function
    return await chromaClient.getOrCreateCollection({
      name: collectionId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } catch (error) {
    console.log("💥 Error creating collection:", error);
    throw error;
  }
}

/**
 * Create ChromaDB collection and add file contents
 */
export async function storeInChromaDB(
  repositoryId: string,
  files: FileContent[],
  collectionType: "code" | "discussions" = "code"
): Promise<string> {
  const collectionId = `repo_${repositoryId}_${collectionType}`;
  console.log(
    `📊 Starting vector embedding process for ${files.length} files in collection: ${collectionId}`
  );

  try {
    console.log(
      `🔄 Connecting to ChromaDB and getting collection: ${collectionId}`
    );
    const collection = await getOrCreateCollection(collectionId);
    console.log(`✅ Successfully connected to collection: ${collectionId}`);
    console.log(`🔌 Using collection: ${collectionId}`);

    let totalProcessedChunks = 0;
    let totalProcessedFiles = 0;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(files.length / BATCH_SIZE);
      const batch = files.slice(i, i + BATCH_SIZE);
      console.log(
        `🔄 Processing batch ${batchNumber}/${totalBatches} with ${batch.length} files`
      );

      const chunks: {
        ids: string[];
        documents: string[];
        metadatas: Record<string, string | number | boolean>[];
      } = {
        ids: [],
        documents: [],
        metadatas: [],
      };

      for (const file of batch) {
        try {
          if (file.content.length > CHUNK_SIZE) {
            const fileChunks = splitIntoChunks(file.content, CHUNK_SIZE);
            console.log(
              `📄 File ${file.path} split into ${fileChunks.length} chunks`
            );

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
            const fileId = `${repositoryId}_${file.path}`;
            chunks.ids.push(fileId);
            chunks.documents.push(file.content);
            chunks.metadatas.push(
              createFileMetadata(repositoryId, file.path, file.language)
            );
          }
          totalProcessedFiles++;
        } catch (error) {
          console.error(`❌ Error processing file ${file.path}:`, error);
        }
      }
      if (chunks.ids.length > 0) {
        try {
          console.log(
            `🔄 Adding ${chunks.ids.length} chunks to ChromaDB (batch ${batchNumber}/${totalBatches})`
          );
          console.log(
            `🔍 First chunk ID: ${chunks.ids[0]}, metadata: ${JSON.stringify(
              chunks.metadatas[0]
            )}`
          );
          const timeout = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error("Operation timed out after 60 seconds")),
              60000
            );
          });
          await Promise.race([
            collection.add({
              ids: chunks.ids,
              documents: chunks.documents,
              metadatas: chunks.metadatas,
            }),
            timeout,
          ]);
          totalProcessedChunks += chunks.ids.length;
          console.log(
            `✅ Successfully added ${chunks.ids.length} chunks to ChromaDB (total: ${totalProcessedChunks})`
          );
        } catch (error) {
          console.error(`❌ Error adding chunks to ChromaDB:`, error);
          if (error instanceof Error) {
            console.error(`Error details: ${error.message}`);
            console.error(`Error stack: ${error.stack}`);
          }
          console.log(`🔍 Collection information: ${collectionId}`);
          console.log(
            `⚠️ Skipping current batch due to error, continuing with next batch`
          );
        }
      }
    }
    console.log(
      `✅ Vector embedding process completed: ${totalProcessedFiles}/${files.length} files processed, ${totalProcessedChunks} total chunks created`
    );
    return collectionId;
  } catch (error) {
    console.error(`❌ Error in storeInChromaDB:`, error);
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    console.log(`⚠️ Returning collection ID despite errors: ${collectionId}`);
    return collectionId;
  }
}

/**
 * Reset the entire ChromaDB instance - WARNING: Deletes all data!
 */
export async function resetChromaDB(): Promise<void> {
  console.log("🔥 Resetting ChromaDB...");
  const path = `${
    process.env.CHROMA_API_URL || "http://chromadb:8000"
  }/api/v1/reset`;
  const response = await fetch(path, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`💥 Error resetting ChromaDB: ${response.statusText}`);
  }
  console.log("🏁 ChromaDB has been reset");
}

/**
 * Format the results for display in the chat UI
 */
export function formatChromaResults(results: RepositoryQueryResult) {
  return results
    .map((result) => {
      return `
FILE: ${result.metadata.path}
CONTENT: ${result.content}
${
  result.type === "discussion" && result.metadata.url
    ? `URL: ${result.metadata.url}`
    : ""
}
---
    `;
    })
    .join("\n");
}

/**
 * Transforms raw ChromaDB query results into structured repository query result items
 */
function transformChromaResults(
  results: {
    documents?: (string | null)[][];
    metadatas?: (Record<string, unknown> | null)[][];
    distances?: number[][] | null;
  },
  type: "code" | "discussion"
): RepositoryQueryResultItem[] {
  const transformedResults: RepositoryQueryResultItem[] = [];
  if (results.documents && results.documents[0]) {
    for (let i = 0; i < results.documents[0].length; i++) {
      transformedResults.push({
        content: results.documents[0][i] || "",
        metadata: results.metadatas?.[0]?.[i] || {},
        distance: (results.distances && results.distances[0][i]) ?? i * 0.1,
        type: type,
      });
    }
  }
  return transformedResults;
}

/**
 * Query the ChromaDB collection for the given repository ID and query text
 */
export async function queryRepository(
  repositoryId: string,
  query: string
): Promise<RepositoryQueryResult> {
  console.log(`🔍 queryRepository called with:`, { repositoryId, query });
  try {
    const codeCollectionId = `repo_${repositoryId}_code`;
    const discussionsCollectionId = `repo_${repositoryId}_discussions`;
    const codeCollection = await getOrCreateCollection(codeCollectionId);
    const discussionsCollection = await getOrCreateCollection(
      discussionsCollectionId
    );

    const codeResults = await codeCollection.query({
      queryTexts: [query],
      nResults: Number(process.env.CHROMA_RESULTS_NUMBER) || 5,
    });

    const discussionResults = await discussionsCollection.query({
      queryTexts: [query],
      nResults: Number(process.env.CHROMA_RESULTS_NUMBER) || 5,
    });

    const codeResultsWithMetadata = transformChromaResults(codeResults, "code");

    const discussionResultsWithMetadata = transformChromaResults(
      discussionResults,
      "discussion"
    );

    const combinedResults = [
      ...codeResultsWithMetadata,
      ...discussionResultsWithMetadata,
    ].sort((a, b) => (a.distance ?? 1) - (b.distance ?? 1));

    console.log(`🏁 Query completed, returning combined results`);
    return combinedResults;
  } catch (error) {
    console.error("💥 Error in queryRepository:", error);
    throw error;
  }
}
