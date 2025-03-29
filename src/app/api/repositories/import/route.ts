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
    let accessToken;
    try {
      accessToken = await getGitHubAccessToken();
    } catch (error) {
      // Check if this is our specific token expired error
      if (error instanceof Error && error.message === "GITHUB_TOKEN_EXPIRED") {
        return NextResponse.json(
          {
            error: "GitHub session expired",
            code: "GITHUB_TOKEN_EXPIRED",
            message:
              "Your GitHub session has expired. Please log out and log in again.",
          },
          { status: 401 }
        );
      }
      // TODO: implement an error handler that can be reused for all endpoints
      throw error; // Rethrow any other errors
    }

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

    // CHANGED: Wait for import to complete instead of doing it in the background
    try {
      // Let the service handle everything: checking for existing repo, creating if needed,
      // cloning, analyzing, and storing in ChromaDB
      const repository = await importRepository(repoUrl, accessToken, user.id);

      console.log(`Repository import completed for ID: ${repository.id}`);

      // Return success with repository data
      return NextResponse.json({
        success: true,
        message: "Repository import completed successfully",
        status: "ready",
        repositoryId: repository.id,
        repository: repository,
      });
    } catch (error) {
      console.error("Repository import failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return NextResponse.json(
        {
          error: "Failed to import repository",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
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
