import { ChromaClient, Collection } from "chromadb";

// Singleton pattern to reuse the client
let chromaClient: ChromaClient | null = null;

// Create a default embedding function that meets the IEmbeddingFunction interface
class DefaultEmbeddingFunction {
  // This implements the required method of ChromaDB's embedding interface
  async generate(texts: string[]): Promise<number[][]> {
    // Just return empty embeddings - ChromaDB will use its default internally
    console.log("Using ChromaDB's default embedding function");
    return texts.map(() => []);
  }
}

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

  // Create a default embedding function instance
  const defaultEmbedding = new DefaultEmbeddingFunction();

  try {
    // First try to get the collection
    return await chromaClient.getCollection({
      name: collectionId,
      embeddingFunction: defaultEmbedding,
    });
  } catch (error) {
    console.log(error);
    console.log(`Collection ${collectionId} not found, creating...`);

    // Create collection
    return await chromaClient.createCollection({
      name: collectionId,
      embeddingFunction: defaultEmbedding,
    });
  }
}
