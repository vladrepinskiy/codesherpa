import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export const supabaseClient = createClient();

const fetchRepository = async (id: string) => {
  const supabase = supabaseClient;

  const { data: repository, error: repoError } = await supabase
    .from("repositories")
    .select("*, user_repositories!inner(is_favorite)")
    .eq("id", id)
    .single();

  if (repoError || !repository) {
    throw new Error(repoError?.message || "Failed to fetch repository");
  }

  const { count: filesCount } = await supabase
    .from("repository_files")
    .select("id", { count: "exact", head: true })
    .eq("repository_id", id);

  const { count: discussionsCount } = await supabase
    .from("repository_discussions")
    .select("id", { count: "exact", head: true })
    .eq("repository_id", id);

  const { data: discussionsData } = await supabase
    .from("repository_discussions")
    .select("author")
    .eq("repository_id", id);

  const uniqueAuthors = new Set(
    discussionsData?.map((discussion) => discussion.author)
  );

  return {
    ...repository,
    isFavorite: repository.user_repositories[0]?.is_favorite || false,
    filesCount: filesCount || 0,
    discussionsCount: discussionsCount || 0,
    uniqueAuthorsCount: uniqueAuthors?.size || 0,
  };
};

export function useRepository(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `repository/${id}` : null,
    () => fetchRepository(id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    repository: data,
    isLoading,
    isError: error,
    mutate,
  };
}
