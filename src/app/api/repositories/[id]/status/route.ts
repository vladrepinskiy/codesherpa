import { NextResponse } from "next/server";
import { checkRepositoryAccess } from "@/lib/supabase/user-service";
import { getRepositoryStatus } from "@/lib/supabase/repos-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: repositoryId } = await params;
    const accessResult = await checkRepositoryAccess(repositoryId);
    if (accessResult instanceof Response) {
      return accessResult;
    }
    const repository = await getRepositoryStatus(repositoryId);
    return NextResponse.json({
      id: repository.id,
      status: repository.status,
      errorMessage: repository.error_message,
      lastAnalyzed: repository.last_analyzed,
      currentStage: repository.current_stage || "Processing",
    });
  } catch (error) {
    console.error("Error in status endpoint:", error);
    return NextResponse.json(
      { error: "Failed to get repository status" },
      { status: 500 }
    );
  }
}
