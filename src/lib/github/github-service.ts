import { createClient } from "@/lib/supabase/server";

export async function getGitHubAccessToken() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No active session found");
    }
    const providerToken = session.provider_token;
    if (!providerToken) {
      console.warn("GitHub token not found or expired - session needs refresh");
      // Return a specific error - token expired
      throw new Error("GITHUB_TOKEN_EXPIRED");
    }
    console.log("Successfully retrieved GitHub token");
    console.log(`Token preview: ${providerToken.substring(0, 10)}...`);
    return providerToken;
  } catch (error) {
    console.error("Error getting GitHub token:", error);
    throw error;
  }
}
