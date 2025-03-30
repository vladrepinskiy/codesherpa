import { createClient } from "@/lib/supabase/server";
import { queryRepository } from "@/lib/chromadb/chroma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: repositoryId } = await params;
    const { query } = await request.json();

    // Authenticate the request
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this repository
    const { data: userRepo } = await supabase
      .from("user_repositories")
      .select("*")
      .eq("user_id", user.id)
      .eq("repository_id", repositoryId)
      .single();

    if (!userRepo) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // Query the repository
    const results = await queryRepository(repositoryId, query);

    // Return results
    return NextResponse.json({
      results: results,
      metadata: {
        query,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing chat query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
