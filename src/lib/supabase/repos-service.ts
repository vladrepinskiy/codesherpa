import { createClient } from "@/lib/supabase/server";
import { Repository } from "@/types/repository";

export type RepositoryQueryParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
};

export type EnrichedRepository = Repository & {
  isFavorite: boolean;
  lastAccessed: string;
  notes?: string;
};

/**
 * Fetches user repositories with pagination and ordering
 */
export async function getUserRepositories(
  userId: string,
  params: RepositoryQueryParams = {}
): Promise<{ repositories: EnrichedRepository[]; error?: unknown }> {
  try {
    const supabase = await createClient();

    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const orderBy = params.orderBy || "last_accessed";
    const orderDirection = params.orderDirection || "desc";

    const { data: userRepositories, error } = await supabase
      .from("user_repositories")
      .select("*, repository:repository_id(*)")
      .eq("user_id", userId)
      .order(orderBy === "name" ? "repository(name)" : orderBy, {
        ascending: orderDirection === "asc",
      })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching user repositories:", error);
      return { repositories: [], error };
    }

    // Get the "enriched" format expected by the frontend
    const repositories = userRepositories.map((userRepo) => {
      const repo = userRepo.repository as Repository;
      return {
        ...repo,
        isFavorite: userRepo.is_favorite,
        lastAccessed: userRepo.last_accessed,
        notes: userRepo.notes,
      };
    });

    return { repositories };
  } catch (error) {
    console.error("Error in getUserRepositories:", error);
    return { repositories: [], error };
  }
}

/**
 * Gets the total count of repositories for a user
 */
export async function getUserRepositoryCount(
  userId: string
): Promise<{ count: number; error?: unknown }> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("user_repositories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error getting repository count:", error);
      return { count: 0, error };
    }

    return { count: count || 0 };
  } catch (error) {
    console.error("Error in getUserRepositoryCount:", error);
    return { count: 0, error };
  }
}

/**
 * Fetches repositories with pagination and count in a single function
 */
export async function getPaginatedUserRepositories(
  userId: string,
  params: RepositoryQueryParams = {}
): Promise<{
  repositories: EnrichedRepository[];
  pagination: { total: number; limit: number; offset: number };
  error?: unknown;
}> {
  try {
    const { repositories, error: reposError } = await getUserRepositories(
      userId,
      params
    );
    const { count, error: countError } = await getUserRepositoryCount(userId);

    const error = reposError || countError;

    return {
      repositories,
      pagination: {
        total: count || repositories.length,
        limit: params.limit || 20,
        offset: params.offset || 0,
      },
      error: error || undefined,
    };
  } catch (error) {
    console.error("Error in getPaginatedUserRepositories:", error);
    return {
      repositories: [],
      pagination: {
        total: 0,
        limit: params.limit || 20,
        offset: params.offset || 0,
      },
      error,
    };
  }
}
