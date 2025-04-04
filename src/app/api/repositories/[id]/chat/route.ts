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
    const { messages, contextHistory } = await request.json();
    const accessResult = await checkRepositoryAccess(repositoryId);
    if (accessResult instanceof Response) {
      return accessResult;
    }

    const systemMessage = getSystemMessageV2();

    let messagesWithSystem = [systemMessage, ...messages];
    if (contextHistory && contextHistory.length > 0) {
      const contextMessage = {
        role: "system",
        content:
          "Previously retrieved repository context:\n\n" +
          contextHistory.join("\n\n"),
      };
      messagesWithSystem = [systemMessage, contextMessage, ...messages];
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesWithSystem,
      maxSteps: 2,
      toolCallStreaming: true,
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
              const results = await queryRepository(repositoryId, query);
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
