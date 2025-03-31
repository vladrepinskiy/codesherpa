import { NextRequest, NextResponse } from "next/server";
import { checkRepositoryAccess } from "@/lib/supabase/user-service";
import { checkRepositoryIntegrity } from "@/lib/data-integrity/data-integrity-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: repositoryId } = params;

    const accessResult = await checkRepositoryAccess(repositoryId);
    if (accessResult instanceof Response) {
      return accessResult;
    }

    const integrityResult = await checkRepositoryIntegrity(repositoryId);
    return NextResponse.json(integrityResult);
  } catch (error) {
    console.error("Error verifying data integrity:", error);
    return NextResponse.json(
      { error: "Failed to verify data integrity", details: String(error) },
      { status: 500 }
    );
  }
}
