import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaginatedUserRepositories } from "@/lib/supabase/repos-service";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check pagination/filtering parameters
    const url = new URL(request.url);
    const params = {
      limit: parseInt(url.searchParams.get("limit") || "20"),
      offset: parseInt(url.searchParams.get("offset") || "0"),
      orderBy: url.searchParams.get("orderBy") || "last_accessed",
      orderDirection: (url.searchParams.get("direction") || "desc") as
        | "asc"
        | "desc",
    };

    const { repositories, pagination, error } =
      await getPaginatedUserRepositories(user!.id, params);

    if (error) {
      console.error("Error getting repositories:", error);
      return NextResponse.json(
        { error: "Failed to fetch repositories" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      repositories,
      pagination,
    });
  } catch (error) {
    console.error("Error in repositories endpoint:", error);
    return NextResponse.json(
      { error: "Failed to retrieve repositories" },
      { status: 500 }
    );
  }
}
