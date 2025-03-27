import { createClient } from "@/lib/supabase/server";

export async function getGitHubAccessToken() {
  try {
    const supabase = await createClient();

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No active session found");
    }

    // For OAuth logins, provider token is in the session
    const providerToken = session.provider_token;

    if (!providerToken) {
      throw new Error(
        "No GitHub token found - user may not be logged in with GitHub"
      );
    }

    console.log("Successfully retrieved GitHub token");

    // Log a preview but return the full token
    console.log(`Token preview: ${providerToken.substring(0, 10)}...`);
    return providerToken; // Return the FULL token
  } catch (error) {
    console.error("Error getting GitHub token:", error);
    throw error;
  }
}
