import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useOnboardingContent(repositoryId: string) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    overview: false,
    structure: false,
    setup: false,
    contribute: false,
  });

  // Initial load - fetch any existing content from Supabase
  useEffect(() => {
    async function fetchStoredContent() {
      try {
        const { data, error } = await supabase
          .from("onboarding_content")
          .select("tab, content")
          .eq("repository_id", repositoryId);

        if (error) throw error;

        if (data?.length) {
          const contentByTab: Record<string, string> = {};

          data.forEach((item) => {
            contentByTab[item.tab] = item.content;
          });

          setContent(contentByTab);
        }
      } catch (error) {
        console.error("Error fetching stored onboarding content:", error);
      }
    }

    fetchStoredContent();
  }, [repositoryId]);

  // Function to generate content for a specific tab
  const generateContent = async (tab: string) => {
    // Skip if already loading
    if (isLoading[tab]) return;

    // Skip if we already have content for this tab
    if (content[tab]) return;

    setIsLoading((prev) => ({ ...prev, [tab]: true }));

    try {
      // First check Supabase again (in case another session generated it)
      const { data } = await supabase
        .from("onboarding_content")
        .select("content")
        .eq("repository_id", repositoryId)
        .eq("tab", tab)
        .single();

      if (data?.content) {
        // Content exists in the database
        setContent((prev) => ({ ...prev, [tab]: data.content }));
      } else {
        // Call API to generate content
        const response = await fetch(
          `/api/repositories/${repositoryId}/onboarding`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tab }),
          }
        );

        const data = await response.json();

        // Update state with new content
        setContent((prev) => ({ ...prev, [tab]: data.content }));

        // Store in database
        await supabase.from("onboarding_content").upsert(
          {
            repository_id: repositoryId,
            tab,
            content: data.content,
            created_at: new Date().toISOString(),
          },
          {
            onConflict: "repository_id,tab",
          }
        );
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  return {
    content,
    isLoading,
    generateContent,
  };
}
