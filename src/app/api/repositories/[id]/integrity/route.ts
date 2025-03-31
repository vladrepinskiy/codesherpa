import { NextResponse } from "next/server";
import { checkRepositoryAccess } from "@/lib/supabase/user-service";
import { checkRepositoryIntegrity } from "@/lib/data-integrity/data-integrity-service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const repoId = await params.id;

    if (!repoId) {
      return NextResponse.json(
        { error: "Repository ID is required" },
        { status: 400 }
      );
    }

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
