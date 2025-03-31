import { useState, useEffect, useRef } from "react";
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

  // Use a ref to track which repositories we're currently polling
  const pollingReposRef = useRef<Set<string>>(new Set());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/repositories?limit=${pagination.limit}&offset=${pagination.offset}&orderBy=last_accessed&direction=desc`,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (refreshTrigger > 0) {
      mutate();
    }
  }, [refreshTrigger, mutate]);

  // Effect to detect repositories that need processing
  useEffect(() => {
    if (!data?.repositories) return;

    const inProgress = data.repositories.filter(
      (repo: Repository) => repo.status !== "ready" && repo.status !== "error"
    );

    if (inProgress.length === 0) {
      if (Object.keys(processingRepos).length > 0) {
        setProcessingRepos({});
      }
      return;
    }

    const newProcessingRepos = Object.fromEntries(
      inProgress.map((repo: Repository) => [
        repo.id,
        repo.current_stage || `Processing ${repo.status}`,
      ])
    );

    // Deep equality check to avoid unnecessary state updates
    const currentIds = Object.keys(processingRepos);
    const newIds = Object.keys(newProcessingRepos);

    const hasChanged =
      currentIds.length !== newIds.length ||
      newIds.some(
        (id) =>
          !currentIds.includes(id) ||
          newProcessingRepos[id] !== processingRepos[id]
      );

    if (hasChanged) {
      setProcessingRepos(newProcessingRepos);
    }

    // Update which repos we should be polling
    pollingReposRef.current = new Set(newIds);
  }, [data, processingRepos]);

  // Separate effect for polling to avoid the infinite loop
  useEffect(() => {
    // If no repos to poll, don't set up polling
    if (pollingReposRef.current.size === 0) return;

    // Setup polling
    const intervalId = setInterval(pollRepositories, 5000);
    return () => clearInterval(intervalId);

    async function pollRepositories() {
      const repoIdsToCheck = Array.from(pollingReposRef.current);
      const updatedProcessingRepos = { ...processingRepos };
      let hasChanges = false;

      for (const repoId of repoIdsToCheck) {
        try {
          const response = await fetch(`/api/repositories/${repoId}/status`);
          const statusData = await response.json();

          if (!response.ok) continue;

          if (statusData.status === "ready" || statusData.status === "error") {
            delete updatedProcessingRepos[repoId];
            pollingReposRef.current.delete(repoId);
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
          }
        } catch (error) {
          console.error(`Error polling repository ${repoId}:`, error);
        }
      }

      if (hasChanges) {
        setProcessingRepos(updatedProcessingRepos);
      }

      // If there are no more repos to poll, clear the interval
      if (pollingReposRef.current.size === 0) {
        clearInterval(intervalId);
        mutate();
      }
    }
  }, [processingRepos, mutate]);

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
