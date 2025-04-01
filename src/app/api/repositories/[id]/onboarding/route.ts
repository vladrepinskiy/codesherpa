import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  formatChromaResults,
  queryRepository,
} from "@/lib/chromadb/chroma-client";
import {
  getSystemMessage,
  getTabPrompt,
  getTabQueryKeywords,
} from "@/lib/analysis/prompt-service";
import { checkRepositoryAccess } from "@/lib/supabase/user-service";
import { getRepoName } from "@/lib/supabase/repos-service";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: repositoryId } = await params;
    const { tab } = await request.json();

    const accessResult = await checkRepositoryAccess(repositoryId);
    if (accessResult instanceof Response) {
      return accessResult;
    }

    const repoName = await getRepoName(repositoryId);

    const query = getTabQueryKeywords(tab);
    const results = await queryRepository(repositoryId, query);
    const contextText = formatChromaResults(results);

    const prompt = getTabPrompt(tab, repoName);
    const systemMessage = getSystemMessage(contextText);

    console.log(process.env.OPENAI_API_KEY);

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemMessage,
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
