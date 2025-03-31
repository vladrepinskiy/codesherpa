import { openai } from "@ai-sdk/openai";
import { Message, streamText } from "ai";
import {
  formatChromaResults,
  queryRepository,
} from "@/lib/chromadb/chroma-client";
import { getSystemMessage } from "@/lib/analysis/prompt-service";
import { checkRepositoryAccess } from "@/lib/supabase/user-service";

export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const repositoryId = await params.id;
    const { messages } = await request.json();
    const latestUserMessage = messages
      .filter((m: Message) => m.role === "user")
      .pop();
    const query = latestUserMessage?.content || "";

    const accessResult = await checkRepositoryAccess(repositoryId);
    if (accessResult instanceof Response) {
      return accessResult;
    }

    const results = await queryRepository(repositoryId, query);
    const contextText = formatChromaResults(results);
    const systemMessageContent = getSystemMessage(contextText);
    const systemMessage = {
      role: "system",
      content: systemMessageContent,
    };
    const messagesWithSystem = [systemMessage, ...messages];
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesWithSystem,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing chat query:", error);
    return new Response(JSON.stringify({ error: "Failed to process query" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
