import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  try {
    // Await the params object to get the id
    const { id: repositoryId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the repository exists and belongs to the user
    const { data: userRepo, error: userRepoError } = await supabase
      .from("user_repositories")
      .select("repository_id")
      .eq("user_id", user.id)
      .eq("repository_id", repositoryId)
      .single();

    if (userRepoError || !userRepo) {
      return NextResponse.json(
        { error: "Repository not found or access denied" },
        { status: 404 }
      );
    }

    // Get the repository status including current_stage
    const { data: repository, error: repoError } = await supabase
      .from("repositories")
      .select("id, status, error_message, last_analyzed, current_stage")
      .eq("id", repositoryId)
      .single();

    if (repoError || !repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // Get file stats if the status is 'ready'
    let fileStats = null;
    if (repository.status === "ready") {
      const { count } = await supabase
        .from("repository_files")
        .select("id", { count: "exact", head: true })
        .eq("repository_id", repositoryId);

      fileStats = {
        fileCount: count || 0,
      };
    }

    return NextResponse.json({
      id: repository.id,
      status: repository.status,
      errorMessage: repository.error_message,
      lastAnalyzed: repository.last_analyzed,
      currentStage: repository.current_stage || "Processing", // Provide a default
      fileStats,
    });
  } catch (error) {
    console.error("Error in status endpoint:", error);
    return NextResponse.json(
      { error: "Failed to get repository status" },
      { status: 500 }
    );
  }
}
