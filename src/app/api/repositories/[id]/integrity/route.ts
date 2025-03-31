import { NextResponse } from "next/server";
import { checkRepositoryAccess } from "@/lib/supabase/user-service";
import { checkRepositoryIntegrity } from "@/lib/data-integrity/data-integrity-service";

// Corrected route handler signature - params should be the second parameter
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Repository ID is required" },
        { status: 400 }
      );
    }

    const repoId = params.id;

    const accessResult = await checkRepositoryAccess(repoId);
    if (accessResult instanceof Response) {
      return accessResult;
    }

    const integrityResult = await checkRepositoryIntegrity(repoId);
    return NextResponse.json(integrityResult);
  } catch (error) {
    console.error("Error verifying data integrity:", error);
    return NextResponse.json(
      { error: "Failed to verify data integrity", details: String(error) },
      { status: 500 }
    );
  }
}
