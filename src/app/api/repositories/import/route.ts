import { NextResponse } from "next/server";
import { initializeRepositoryImport } from "@/lib/import/import-service";
import { createClient } from "@/lib/supabase/server";
import { getGitHubAccessToken } from "@/lib/github/github-client";
import { getErrorMessage } from "@/lib/error-utils";

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "";

  const allowedOrigins = [
    "http://localhost:3000",
    "https://codesherpa.vercel.app/",
  ];

  const isAllowedOrigin = allowedOrigins.includes(origin);

  return new NextResponse(null, {
    status: 204, // No content
    headers: {
      "Access-Control-Allow-Origin": isAllowedOrigin
        ? origin
        : allowedOrigins[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "http://localhost:3000",
    "https://codesherpa.vercel.app/",
  ];
  const isAllowedOrigin = allowedOrigins.includes(origin);

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
          {
            status: 401,
            headers: {
              "Access-Control-Allow-Origin": isAllowedOrigin
                ? origin
                : allowedOrigins[0],
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      }
      throw error;
    }

    const { repoUrl } = await request.json();

    if (!repoUrl || !repoUrl.includes("github.com")) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": isAllowedOrigin
              ? origin
              : allowedOrigins[0],
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }

    // Initialize and queue the repository
    const repository = await initializeRepositoryImport(
      repoUrl,
      accessToken,
      user!.id
    );

    // Return immediately with repository ID
    return NextResponse.json(
      {
        success: true,
        message: "Repository import has been queued",
        status: repository.status,
        repositoryId: repository.id,
        repository: repository,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": isAllowedOrigin
            ? origin
            : allowedOrigins[0],
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("Repository import failed:", error);
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      {
        error: "Failed to import repository",
        details: errorMessage,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": isAllowedOrigin
            ? origin
            : allowedOrigins[0],
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }
}
