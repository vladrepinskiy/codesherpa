import { ChromaClient, Collection } from "chromadb";

// Singleton pattern to reuse the client
let chromaClient: ChromaClient | null = null;

export async function getChromaClient(): Promise<ChromaClient> {
  if (!chromaClient) {
    chromaClient = new ChromaClient({
      path: process.env.CHROMA_API_URL || "http://chromadb:8000",
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
 * Reset the entire ChromaDB instance - WARNING: Deletes all data!
 */
export async function resetChromaDB(): Promise<void> {
  console.log("🔥 Resetting ChromaDB...");
  // ChromaDB has a reset API that can be called
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

export async function queryRepository(repositoryId: string, query: string) {
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
      nResults: 5,
    });

    const discussionResults = await discussionsCollection.query({
      queryTexts: [query],
      nResults: 5,
    });

    const codeResultsWithMetadata = [];
    if (codeResults.documents && codeResults.documents[0]) {
      for (let i = 0; i < codeResults.documents[0].length; i++) {
        codeResultsWithMetadata.push({
          content: codeResults.documents[0][i],
          metadata: codeResults.metadatas?.[0]?.[i] || {},
          // Use the distance if available, otherwise use a default ranking value
          distance: codeResults.distances?.[0]?.[i] ?? i * 0.1,
          type: "code",
        });
      }
    }

    const discussionResultsWithMetadata = [];
    if (discussionResults.documents && discussionResults.documents[0]) {
      for (let i = 0; i < discussionResults.documents[0].length; i++) {
        discussionResultsWithMetadata.push({
          content: discussionResults.documents[0][i],
          metadata: discussionResults.metadatas?.[0]?.[i] || {},
          distance: discussionResults.distances?.[0]?.[i] ?? i * 0.1 + 1,
          type: "discussion",
        });
      }
    }

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
