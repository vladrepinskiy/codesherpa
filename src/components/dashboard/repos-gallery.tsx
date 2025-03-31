"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRepositoryContext } from "../../contexts/repos-context";
import { RepositoryCard } from "./repo-card";
import { useRepositoriesGallery } from "@/hooks/use-repos-gallery";
import {
  RepositoryLoadingState,
  RepositoryErrorState,
  EmptyRepositoryState,
} from "@/components/dashboard/repos-gallery-states";
import { EnrichedRepository } from "@/types/repository";

export default function RepositoryGallery() {
  const [pagination, setPagination] = useState({
    limit: 12,
    offset: 0,
  });

  const { refreshTrigger } = useRepositoryContext();

  const {
    repositories,
    totalCount,
    isLoading,
    error,
    mutate,
    processingRepos,
    deleteRepository,
  } = useRepositoriesGallery(refreshTrigger, pagination);

  // Handle pagination
  const handleLoadMore = () => {
    setPagination((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  // Handle repository view
  if (isLoading) {
    return (
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Your Repositories</h2>
        <RepositoryLoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Your Repositories</h2>
        <RepositoryErrorState onRetry={() => mutate()} />
      </div>
    );
  }

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
            {repositories.map((repo: EnrichedRepository) => (
              <RepositoryCard
                key={repo.id}
                repository={repo}
                onDelete={deleteRepository}
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
        <EmptyRepositoryState />
      )}
    </div>
  );
}
