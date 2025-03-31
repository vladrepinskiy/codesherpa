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

// Server-side function to get user profile
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
