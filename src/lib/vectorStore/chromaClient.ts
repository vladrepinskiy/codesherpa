import { ChromaClient } from "chromadb";

const chromaUrl = process.env.CHROMA_API_URL || "http://localhost:8000";

let client: ChromaClient | null = null;

export function getChromaClient(): ChromaClient {
  if (!client) {
    client = new ChromaClient({
      path: chromaUrl,
    });
    console.log(`ChromaDB client initialized with URL: ${chromaUrl}`);
  }
  return client;
}
