import { createClient } from "@/lib/supabase/server";
import { EnrichedRepository, Repository } from "@/types/repository";

export type RepositoryQueryParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
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

/**
 * Creates a new repository in supabase with status "importing"
 */
export async function createRepository(
  metadata: Partial<Repository>
): Promise<{ repository: Repository | null }> {
  try {
    const supabase = await createClient();
    const { data: newRepository, error: repoError } = await supabase
      .from("repositories")
      .insert({
        ...metadata,
        status: "importing",
        last_analyzed: null,
        error_message: null,
        current_stage: "Initializing repository",
      })
      .select()
      .single();
    if (repoError)
      throw new Error(
        `Failed to create repository record: ${repoError.message}`
      );
    return { repository: newRepository };
  } catch (error) {
    console.error("Could not create repository in supabase:", error);
    throw error;
  }
}

// TODO handle errors in supabase helper functions

/**
 * Updates the current stage of a repository
 */
export async function updateStage(stage: string, repoId: string) {
  const supabase = await createClient();
  await supabase
    .from("repositories")
    .update({ current_stage: stage })
    .eq("id", repoId);
}

/**
 * Updates the status of a repository
 */
export async function updateStatus(
  status: string,
  repoId: string
): Promise<Repository> {
  const supabase = await createClient();
  const { data: updatedRepo, error } = await supabase
    .from("repositories")
    .update({ status: status, last_analyzed: new Date().toISOString() })
    .eq("id", repoId);
  if (error) throw error;
  return updatedRepo!;
}

/**
 * Gets the status of a repository
 */
export async function getRepositoryStatus(repositoryId: string) {
  const supabase = await createClient();
  const { data: repository, error } = await supabase
    .from("repositories")
    .select("id, status, error_message, last_analyzed, current_stage")
    .eq("id", repositoryId)
    .single();
  if (error) throw error;
  return repository;
}

/**
 * Cleans all files associated with the repository in supabase
 */
export async function cleanRepositoryFiles(repoId: string) {
  const supabase = await createClient();
  await supabase.from("repository_files").delete().eq("repository_id", repoId);
}

/**
 * Gets the number of files in a repository
 */
export async function getRepositoryFileCount(repoId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("repository_files")
    .select("*", { count: "exact", head: true })
    .eq("repository_id", repoId);
  if (error) throw error;
  return count;
}

/**
 * Gets the number of discussions in a repository
 */
export async function getRepositoryDiscussionsCount(repoId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("repository_discussions")
    .select("*", { count: "exact", head: true })
    .eq("repository_id", repoId);
  if (error) throw error;
  return count;
}

/**
 * Gets the name of a repository by id
 */
export async function getRepoName(repoId: string) {
  const supabase = await createClient();
  const { data: repository, error } = await supabase
    .from("repositories")
    .select("name")
    .eq("id", repoId)
    .single();
  if (error) throw error;
  return repository?.name;
}
