import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { queryRepository } from "@/lib/chromadb/chroma-client";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Correctly access params without awaiting it (it's already resolved)
    const repositoryId = params.id;
    const { messages } = await request.json();

    // Get the latest user message to use as query
    const latestUserMessage = messages.filter((m) => m.role === "user").pop();
    const query = latestUserMessage?.content || "";

    // Authenticate the request
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user has access to this repository
    const { data: userRepo } = await supabase
      .from("user_repositories")
      .select("*")
      .eq("user_id", user.id)
      .eq("repository_id", repositoryId)
      .single();

    if (!userRepo) {
      return new Response(JSON.stringify({ error: "Repository not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get repository info
    const { data: repository } = await supabase
      .from("repositories")
      .select("name")
      .eq("id", repositoryId)
      .single();

    // Query the repository
    const results = await queryRepository(repositoryId, query);

    // Format the context from ChromaDB results
    const contextText = results
      .map((result) => {
        return `
${result.type === "code" ? "FILE" : "DISCUSSION"}: ${result.metadata.path}
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

    // Create the system message with content string instead of parts array
    const systemMessage = {
      role: "system",
      content: `You are an AI assistant that helps users understand and navigate the "${repository?.name}" GitHub repository.
        
REPOSITORY CONTEXT:
${contextText}

Analyze the above repository context to answer the user's query. 
Reference specific files and code when relevant.
If the context doesn't contain enough information to answer fully, acknowledge this limitation.`,
    };

    // Add system message to the beginning of the messages array
    const messagesWithSystem = [systemMessage, ...messages];

    // Stream the response
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
