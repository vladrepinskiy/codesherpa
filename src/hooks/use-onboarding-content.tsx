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

  const generateContent = async (tab: string) => {
    if (isLoading[tab] || content[tab]) return;

    setIsLoading((prev) => ({ ...prev, [tab]: true }));

    try {
      const { data } = await supabase
        .from("onboarding_content")
        .select("content")
        .eq("repository_id", repositoryId)
        .eq("tab", tab)
        .single();

      if (data?.content) {
        setContent((prev) => ({ ...prev, [tab]: data.content }));
      } else {
        const response = await fetch(
          `/api/repositories/${repositoryId}/onboarding`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tab }),
          }
        );
        const data = await response.json();
        setContent((prev) => ({ ...prev, [tab]: data.content }));

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
