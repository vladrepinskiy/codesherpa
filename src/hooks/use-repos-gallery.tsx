import { useState, useEffect } from "react";
import useSWR from "swr";
import { Repository } from "@/types/repository";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch repositories");
    return res.json();
  });

export function useRepositoriesGallery(
  refreshTrigger: number,
  pagination: { limit: number; offset: number }
) {
  const [processingRepos, setProcessingRepos] = useState<
    Record<string, string>
  >({});

  // SWR hook for fetching repositories
  const { data, error, isLoading, mutate } = useSWR(
    `/api/repositories?limit=${pagination.limit}&offset=${pagination.offset}&orderBy=last_accessed&direction=desc`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Effect to trigger refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      mutate();
    }
  }, [refreshTrigger, mutate]);

  // Effect to detect and poll for repositories in progress
  useEffect(() => {
    if (!data?.repositories) return;

    // Find repositories that are still processing
    const inProgress = data.repositories.filter(
      (repo: Repository) => repo.status !== "ready" && repo.status !== "error"
    );

    if (inProgress.length === 0) {
      if (Object.keys(processingRepos).length > 0) {
        setProcessingRepos({});
      }
      return;
    }

    // Set up processing repos tracking
    const newProcessingRepos = Object.fromEntries(
      inProgress.map((repo: Repository) => [
        repo.id,
        repo.current_stage || `Processing ${repo.status}`,
      ])
    );

    setProcessingRepos(newProcessingRepos);

    // Setup polling
    const intervalId = setInterval(pollRepositories, 5000);
    return () => clearInterval(intervalId);

    async function pollRepositories() {
      const updatedProcessingRepos = { ...newProcessingRepos };
      let shouldContinuePolling = false;
      let hasChanges = false;

      for (const repoId of Object.keys(updatedProcessingRepos)) {
        try {
          const response = await fetch(`/api/repositories/${repoId}/status`);
          const statusData = await response.json();

          if (!response.ok) continue;

          if (statusData.status === "ready" || statusData.status === "error") {
            delete updatedProcessingRepos[repoId];
            hasChanges = true;

            // Show notification
            if (statusData.status === "ready") {
              toast.success(`Repository analysis complete!`);
            } else {
              toast.error(`Repository import failed`);
            }
          } else {
            const newStage =
              statusData.currentStage || `Processing ${statusData.status}`;
            if (updatedProcessingRepos[repoId] !== newStage) {
              updatedProcessingRepos[repoId] = newStage;
              hasChanges = true;
            }
            shouldContinuePolling = true;
          }
        } catch (error) {
          console.error(`Error polling repository ${repoId}:`, error);
          shouldContinuePolling = true;
        }
      }

      if (hasChanges) {
        setProcessingRepos(updatedProcessingRepos);
      }

      if (!shouldContinuePolling) {
        clearInterval(intervalId);
        mutate();
      }
    }
  }, [data, mutate]);

  async function deleteRepository(repositoryId: string) {
    try {
      const response = await fetch(`/api/repositories/${repositoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete repository");
      }

      mutate();
      toast.success("Repository deleted successfully");
    } catch (error) {
      console.error("Error deleting repository:", error);
      toast.error("Error deleting repository");
    }
  }

  return {
    repositories: data?.repositories || [],
    totalCount: data?.pagination?.total || 0,
    isLoading,
    error,
    mutate,
    processingRepos,
    deleteRepository,
  };
}
