"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Repository } from "@/types/repository";
import { useRepositoryContext } from "../../../../contexts/repos-context";
import { toast } from "sonner";
import { RepositoryCard } from "./repo-card";

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch repositories");
    return res.json();
  });

export default function RepositoryGallery() {
  const [pagination, setPagination] = useState({
    limit: 12,
    offset: 0,
  });
  // State to track repositories that are still processing
  const [processingRepos, setProcessingRepos] = useState<
    Record<string, string>
  >({});

  const { refreshTrigger } = useRepositoryContext();

  // SWR hook for fetching repositories
  const { data, error, isLoading, mutate } = useSWR(
    `/api/repositories?limit=${pagination.limit}&offset=${pagination.offset}&orderBy=last_accessed&direction=desc`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Effect to trigger refresh when refreshTrigger changes
  // This is called when import form triggers a refresh
  useEffect(() => {
    if (refreshTrigger > 0) {
      mutate();
    }
  }, [refreshTrigger, mutate]);

  // Effect to detect and poll for repositories in progress
  useEffect(() => {
    if (!data || !data.repositories) return;

    // Find repositories that are still processing
    const inProgress = data.repositories.filter(
      (repo: Repository) => repo.status !== "ready" && repo.status !== "error"
    );

    if (inProgress.length === 0) {
      // Clear the processing repos state if there are none
      if (Object.keys(processingRepos).length > 0) {
        setProcessingRepos({});
      }
      return;
    }

    // Create a new object to track processing repositories and their current stage
    const newProcessingRepos: Record<string, string> = {};

    inProgress.forEach((repo: Repository) => {
      newProcessingRepos[repo.id] =
        repo.current_stage || `Processing ${repo.status}`;
    });

    // Update processing repos state
    setProcessingRepos(newProcessingRepos);

    // Set up polling interval
    const intervalId = setInterval(async () => {
      const updatedProcessingRepos = { ...newProcessingRepos };
      let shouldContinuePolling = false;
      let hasChanges = false;

      // Check each processing repository
      for (const repoId of Object.keys(updatedProcessingRepos)) {
        try {
          const response = await fetch(`/api/repositories/${repoId}/status`);
          const statusData = await response.json();

          if (response.ok) {
            if (
              statusData.status === "ready" ||
              statusData.status === "error"
            ) {
              // Repository is done processing
              delete updatedProcessingRepos[repoId];
              hasChanges = true;

              // Show a toast notification
              if (statusData.status === "ready") {
                toast.success(`Repository analysis complete!`);
              } else {
                toast.error(`Repository import failed`);
              }
            } else {
              // Still processing, update the current stage if it changed
              const newStage =
                statusData.currentStage || `Processing ${statusData.status}`;
              if (updatedProcessingRepos[repoId] !== newStage) {
                updatedProcessingRepos[repoId] = newStage;
                hasChanges = true;
              }
              shouldContinuePolling = true;
            }
          }
        } catch (error) {
          console.error(`Error polling repository ${repoId}:`, error);
          shouldContinuePolling = true; // Keep polling even if there's an error
        }
      }

      // Update state if there were changes
      if (hasChanges) {
        setProcessingRepos(updatedProcessingRepos);
      }

      // If all repositories are done processing, stop polling and refresh the gallery
      if (!shouldContinuePolling) {
        clearInterval(intervalId);
        mutate();
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [data, mutate, JSON.stringify(Object.keys(processingRepos).sort())]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Your Repositories</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className='animate-pulse'>
                <CardHeader className='pb-2'>
                  <div className='h-6 bg-gray-200 rounded w-3/4'></div>
                </CardHeader>
                <CardContent>
                  <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
                  <div className='h-4 bg-gray-200 rounded w-5/6 mb-4'></div>
                  <div className='h-8 bg-gray-200 rounded w-full'></div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Your Repositories</h2>
        <Card className='bg-red-50 border-red-200'>
          <CardContent className='pt-6 text-center'>
            <p className='text-red-500 mb-2'>Error loading repositories</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => mutate()} // Retry loading
              className='mt-2'
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const repositories = data?.repositories || [];
  const totalCount = data?.pagination?.total || 0;

  // Handle repository deletion
  const handleDeleteRepository = async (repositoryId: string) => {
    try {
      const response = await fetch(`/api/repositories/${repositoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete repository");
      }

      // Refresh the repository list after deletion
      mutate();

      // Show success message
      toast.success("Repository deleted successfully");
    } catch (error) {
      console.error("Error deleting repository:", error);
      // Show error message
      toast.error("Error deleting repository");
    }
  };

  // Handle pagination
  const handleLoadMore = () => {
    setPagination((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  return (
    <div className='mb-8'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold'>Your Repositories</h2>
        {repositories.length > 0 && (
          <p className='text-sm text-gray-500'>
            Showing{" "}
            {Math.min(
              repositories.length,
              pagination.offset + pagination.limit
            )}{" "}
            of {totalCount}
          </p>
        )}
      </div>

      {repositories.length > 0 ? (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {repositories.map((repo: Repository & { isFavorite?: boolean }) => (
              <RepositoryCard
                key={repo.id}
                repository={repo}
                onDelete={handleDeleteRepository}
                isProcessing={!!processingRepos[repo.id]}
                processingStage={processingRepos[repo.id]}
              />
            ))}
          </div>

          {repositories.length < totalCount && (
            <div className='text-center mt-6'>
              <Button
                variant='outline'
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className='bg-gray-50 border-dashed'>
          <CardContent className='pt-6 text-center'>
            <p className='text-gray-500 mb-2'>No repositories imported yet</p>
            <p className='text-sm text-gray-400 mb-6'>
              Import your first repository using the form above to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
