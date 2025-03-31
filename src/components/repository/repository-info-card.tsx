"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EnrichedRepository } from "@/types/repository";

interface RepositoryInfoCardProps {
  repository: EnrichedRepository;
}

export function RepositoryInfoCard({ repository }: RepositoryInfoCardProps) {
  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg'>Repository Information</CardTitle>
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Owner</h3>
              <p>{repository.owner}</p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>
                Default Branch
              </h3>
              <div className='flex items-center'>
                <GitBranch className='h-4 w-4 mr-1 text-green-500' />
                <p>{repository.default_branch}</p>
              </div>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Stars</h3>
              <div className='flex items-center'>
                <Star className='h-4 w-4 mr-1 text-yellow-500' />
                <p>{repository.stars_count}</p>
              </div>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>
                Last Analyzed
              </h3>
              <p>
                {repository.last_analyzed
                  ? formatDistanceToNow(new Date(repository.last_analyzed), {
                      addSuffix: true,
                    })
                  : "Not analyzed yet"}
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Status</h3>
              <p
                className={
                  repository.status === "ready"
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {repository.status === "ready" ? "Ready" : repository.status}
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Privacy</h3>
              <p>{repository.is_private ? "Private" : "Public"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
