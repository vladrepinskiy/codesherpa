import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Repository } from "@/types/repository";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check pagination/filtering parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const orderBy = url.searchParams.get("orderBy") || "last_accessed";
    const orderDirection = url.searchParams.get("direction") || "desc";

    const { data: userRepositories, error: userRepoError } = await supabase
      .from("user_repositories")
      .select("*, repository:repository_id(*)")
      .eq("user_id", user!.id)
      .order(orderBy === "name" ? "repository(name)" : orderBy, {
        ascending: orderDirection === "asc",
      })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (userRepoError) {
      console.error("Error fetching user repositories:", userRepoError);
      return NextResponse.json(
        { error: "Failed to fetch repositories" },
        { status: 500 }
      );
    }

    // Format the response to include repository data and user-specific metadata
    const repositories = userRepositories.map((userRepo) => {
      const repo = userRepo.repository as Repository;
      return {
        ...repo,
        isFavorite: userRepo.is_favorite,
        lastAccessed: userRepo.last_accessed,
        notes: userRepo.notes,
      };
    });

    const { count, error: countError } = await supabase
      .from("user_repositories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id);

    if (countError) {
      console.error("Error getting repository count:", countError);
    }

    return NextResponse.json({
      repositories,
      pagination: {
        total: count || repositories.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error in repositories endpoint:", error);
    return NextResponse.json(
      { error: "Failed to retrieve repositories" },
      { status: 500 }
    );
  }
}
