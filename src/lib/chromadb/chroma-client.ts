import { ChromaClient } from "chromadb";

let chromaClient: ChromaClient | null = null;

export async function getChromaClient() {
  if (!chromaClient) {
    chromaClient = new ChromaClient({
      path: process.env.CHROMADB_URL || "http://localhost:8000",
    });
  }

  return chromaClient;
}
