"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Repository } from "@/types/repository";

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

  // SWR hook for fetching repositories
  const { data, error, isLoading, mutate } = useSWR(
    `/api/repositories?limit=${pagination.limit}&offset=${pagination.offset}&orderBy=last_accessed&direction=desc`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10 seconds to catch new imports
    }
  );

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
              <RepositoryCard key={repo.id} repository={repo} />
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

interface RepositoryCardProps {
  repository: Repository & {
    isFavorite?: boolean;
    lastAccessed?: string | null;
    notes?: string | null;
  };
}

function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg truncate'>
          {repository.name}
          {repository.isFavorite && (
            <span className='ml-2 text-yellow-500'>★</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-gray-500 mb-4 line-clamp-2'>
          {repository.description || "No description available"}
        </p>
        <div className='text-xs text-gray-400 mb-4'>
          {repository.status === "ready" ? (
            <span className='text-green-500'>● Ready</span>
          ) : repository.status === "error" ? (
            <span className='text-red-500'>● Error</span>
          ) : (
            <span className='text-yellow-500'>● {repository.status}</span>
          )}
          <span className='ml-2'>
            {repository.stars_count > 0 && `★ ${repository.stars_count}`}
          </span>
        </div>
        <Link href={`/workspace/repository/${repository.id}`}>
          <Button variant='outline' size='sm' className='w-full'>
            View Repository
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
