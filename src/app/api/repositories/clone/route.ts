import { NextResponse } from "next/server";
import { cloneRepository } from "@/lib/analysis/repository-service";
import { createClient } from "@/lib/supabase/server";
import { getGitHubAccessToken } from "@/lib/github/github-service";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const accessToken = await getGitHubAccessToken();

    if (!user || !accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { repoUrl } = await request.json();

    if (!repoUrl || !repoUrl.includes("github.com")) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    // Clone with GitHub access token
    const { repoId, repoDir } = await cloneRepository(
      repoUrl,
      accessToken as string
    );

    return NextResponse.json({
      success: true,
      repoId,
      message: `Repository cloned successfully to ${repoDir}`,
    });
  } catch (error) {
    console.error("Error in clone endpoint:", error);
    return NextResponse.json(
      { error: error || "Failed to clone repository" },
      { status: 500 }
    );
  }
}
