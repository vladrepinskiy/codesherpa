import { NextResponse } from "next/server";
import { importRepository } from "@/lib/analysis/repository-service";
import { createClient } from "@/lib/supabase/server";
import { getGitHubAccessToken } from "@/lib/github/github-service";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get GitHub access token
    const accessToken = await getGitHubAccessToken();

    if (!user || !accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const { repoUrl } = await request.json();

    if (!repoUrl || !repoUrl.includes("github.com")) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    // Create a variable to store the repository ID that we'll get from the background process
    let repositoryId: string | null = null;

    // Start the import process in the background (fire and forget)
    Promise.resolve().then(async () => {
      try {
        // Let the service handle everything: checking for existing repo, creating if needed,
        // cloning, analyzing, and storing in ChromaDB
        const repository = await importRepository(
          repoUrl,
          accessToken,
          user.id
        );
        repositoryId = repository.id;

        console.log(`Repository import completed for ID: ${repositoryId}`);
      } catch (error) {
        console.error("Repository import failed:", error);
        // No need to update status here as the service will handle error states
      }
    });

    // Return immediately with a processing message
    // We're not creating a repository record here, so we don't have an ID yet
    // Client will need to poll a status endpoint that searches by URL or other identifier
    return NextResponse.json({
      success: true,
      message:
        "Repository import started. Please check your repositories list for status.",
      status: "importing",
    });
  } catch (error) {
    console.error("Error in import endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Failed to import repository",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
