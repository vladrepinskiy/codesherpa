import { createClient as createServerClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  github_username?: string;
  avatar_url?: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "created_at" | "updated_at">
>;

/**
 * Gets the user profile from the supabase auth service
 */
export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Checks if a user has access to a repository and returns the repository data,
 * returns a Response if access is denied
 */
export async function checkRepositoryAccess(
  repositoryId: string,
  userId?: string
) {
  try {
    const supabase = await createServerClient();

    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ error: "User not authenticated" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      userId = user.id;
    }

    const { data: userRepo, error } = await supabase
      .from("user_repositories")
      .select("*")
      .eq("user_id", userId)
      .eq("repository_id", repositoryId)
      .single();

    if (error || !userRepo) {
      return new Response(JSON.stringify({ error: "Repository not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return { userRepo };
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error checking repository access: " + error }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function addUserRepository(userId: string, repoId: string) {
  try {
    const supabase = await createServerClient();
    await supabase.from("user_repositories").insert({
      user_id: userId,
      repository_id: repoId,
      is_favorite: false,
    });
  } catch (error) {
    console.error("Error adding user repository:", error);
    throw error;
  }
}
