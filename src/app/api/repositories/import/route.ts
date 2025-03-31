import { NextResponse } from "next/server";
import { importRepository } from "@/lib/import/import-service";
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

    if (!repoUrl || !repoUrl.includes("github.com")) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const repository = await importRepository(repoUrl, accessToken, user!.id);
    return NextResponse.json({
      success: true,
      message: "Repository import completed successfully",
      status: "ready",
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
