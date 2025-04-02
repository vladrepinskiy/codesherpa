import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import {
  formatChromaResults,
  queryRepository,
} from "@/lib/chromadb/chroma-client";
import { checkRepositoryAccess } from "@/lib/supabase/user-service";
import { z } from "zod";
import { getSystemMessageV2 } from "@/lib/analysis/prompt-service";

export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: repositoryId } = await params;
    const { messages } = await request.json();
    const accessResult = await checkRepositoryAccess(repositoryId);
    if (accessResult instanceof Response) {
      return accessResult;
    }

    const systemMessage = getSystemMessageV2();

    const messagesWithSystem = [systemMessage, ...messages];

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesWithSystem,
      maxSteps: 2, // Allow one tool call round-trip
      toolCallStreaming: true, // Enable streaming of tool calls
      tools: {
        searchRepository: {
          description:
            "Search the repository for relevant code files and information",
          parameters: z.object({
            query: z
              .string()
              .describe("The search query to find relevant code"),
          }),
          execute: async ({ query }: { query: string }) => {
            try {
              // Search the repository using ChromaDB
              const results = await queryRepository(repositoryId, query);
              // Format the results
              return formatChromaResults(results);
            } catch (error) {
              console.error("Error querying repository:", error);
              return "Failed to search repository.";
            }
          },
        },
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) =>
        `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  } catch (error) {
    console.error("Error processing chat query:", error);
    return new Response(JSON.stringify({ error: "Failed to process query" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
