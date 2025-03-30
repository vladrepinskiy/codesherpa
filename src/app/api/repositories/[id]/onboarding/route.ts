import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { queryRepository } from "@/lib/chromadb/chroma-client";

// Allow longer processing time for comprehensive analysis
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const repositoryId = params.id;
    const { tab } = await request.json();

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
      .select("name, full_name")
      .eq("id", repositoryId)
      .single();

    // Construct a query based on the tab
    let query = "";
    switch (tab) {
      case "overview":
        query = "repository overview project description goals purpose readme";
        break;
      case "structure":
        query =
          "repository file structure code organization directories architecture";
        break;
      case "setup":
        query =
          "installation setup prerequisites getting started development environment";
        break;
      case "contribute":
        query =
          "contributing guidelines contribution workflow good first issues";
        break;
      default:
        query = "project overview and structure";
    }

    // Query the repository for relevant content
    const results = await queryRepository(repositoryId, query);

    // Format the context from ChromaDB results
    const contextText = results
      .map((result: any) => {
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

    // Define the prompt based on which tab we're generating content for
    let prompt = "";
    switch (tab) {
      case "overview":
        prompt = `Create a comprehensive overview of the "${repository?.name}" repository. Include:
1. A clear, concise description of what the project does and its purpose
2. The main goals and objectives of the project
3. Who would use this project and why
Base your analysis on the repository content below.`;
        break;
      case "structure":
        prompt = `Analyze the structure of the "${repository?.name}" repository. Include:
1. A high-level overview of how the codebase is organized
2. Key directories and their purpose
3. Important files that new contributors should understand first
4. Any architectural patterns being used
Base your analysis on the repository content below.`;
        break;
      case "setup":
        prompt = `Provide setup instructions for the "${repository?.name}" repository. Include:
1. Required prerequisites and dependencies
2. Step-by-step installation guide
3. How to set up a development environment
4. How to run tests or verify the installation
Base your instructions on the repository content below.`;
        break;
      case "contribute":
        prompt = `Explain how to contribute to the "${repository?.name}" repository. Include:
1. Guidelines for contribution
2. Workflow for submitting changes
3. Good first issues or areas where new contributors can help
4. Best practices for this specific project
Base your explanation on the repository content below.`;
        break;
    }

    // Generate the content using the AI model with generateText
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an AI assistant that specializes in helping developers understand GitHub repositories and onboard to new projects. 
          
REPOSITORY CONTEXT:
${contextText}

Analyze the repository context carefully to provide accurate and helpful information.
Format your response in Markdown with clear sections and bullet points where appropriate.
If the context doesn't provide enough information for certain aspects, acknowledge this limitation.`,
      prompt: prompt,
    });

    return new Response(JSON.stringify({ content: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating onboarding content:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate onboarding content" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
