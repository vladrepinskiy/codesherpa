import { NextResponse } from "next/server";
import { initializeRepositoryImport } from "@/lib/import/import-service";
import { createClient } from "@/lib/supabase/server";
import { getGitHubAccessToken } from "@/lib/github/github-client";
import { getErrorMessage } from "@/lib/error-utils";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let accessToken;
    try {
      accessToken = await getGitHubAccessToken();
    } catch (error) {
      // Handle the Github token expiration error
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
      throw error;
    }

    const { repoUrl } = await request.json();

    // TODO: enable zod validation for my routes to generate an OpenAPI spec
    if (!repoUrl || !repoUrl.includes("github.com")) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    // Initialize and queue the repository
    const repository = await initializeRepositoryImport(
      repoUrl,
      accessToken,
      user!.id
    );

    // Return immediately with repository ID
    return NextResponse.json({
      success: true,
      message: "Repository import has been queued",
      status: repository.status,
      repositoryId: repository.id,
      repository: repository,
    });
  } catch (error) {
    console.error("Repository import failed:", error);
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      {
        error: "Failed to import repository",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
