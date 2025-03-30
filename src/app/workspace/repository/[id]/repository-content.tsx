"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ExternalLink,
  Star,
  FileText,
  GitBranch,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SyncStatusCard from "@/app/workspace/repository/[id]/sync-status-card";
import RepositoryChat from "@/app/workspace/repository/[id]/repository-chat";
import { useRepository } from "@/hooks/use-repository";

export default function RepositoryContent({ id }: { id: string }) {
  const router = useRouter();
  const { repository, isLoading, isError } = useRepository(id);
  const [isVisible, setIsVisible] = useState(false);

  // Handle error state
  useEffect(() => {
    if (isError) {
      router.push("/workspace/dashboard");
    }
  }, [isError, router]);

  // Handle fade-in effect
  useEffect(() => {
    if (repository && !isLoading) {
      // Short delay to ensure loading component is fully unmounted
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [repository, isLoading]);

  // If still loading, the loading.tsx will be shown automatically
  if (!repository) {
    return null;
  }

  return (
    <div
      className={`container mx-auto py-10 px-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className='mb-8'>
        <Link href='/workspace/dashboard'>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ChevronLeft className='mr-1 h-4 w-4' /> Back to Dashboard
          </Button>
        </Link>

        <div className='flex justify-between items-start mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2 flex items-center'>
              {repository.name}
              {repository.isFavorite && (
                <span className='ml-2 text-yellow-500'>
                  <Star className='h-6 w-6 fill-current' />
                </span>
              )}
            </h1>
            <p className='text-lg text-gray-600'>{repository.full_name}</p>
            {repository.description && (
              <p className='mt-4 text-gray-700'>{repository.description}</p>
            )}
          </div>

          <a
            href={`https://github.com/${repository.full_name}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 flex items-center'
          >
            <ExternalLink className='mr-1 h-4 w-4' /> View on GitHub
          </a>
        </div>

        {/* Updated grid with uniform height cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          {/* Combined Files and Discussions Stats Card */}
          <Card className='h-full flex flex-col'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg'>Statistics</CardTitle>
            </CardHeader>
            <CardContent className='flex-grow flex flex-col justify-center'>
              <div className='space-y-4'>
                <div className='flex items-center'>
                  <FileText className='h-5 w-5 mr-3 text-blue-500' />
                  <div>
                    <p className='text-2xl font-bold'>
                      {repository.filesCount}
                    </p>
                    <p className='text-sm text-gray-500'>Files</p>
                  </div>
                </div>

                <div className='flex items-center'>
                  <MessageCircle className='h-5 w-5 mr-3 text-purple-500' />
                  <div>
                    <p className='text-2xl font-bold'>
                      {repository.discussionsCount}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Discussions
                      <span className='ml-2 text-xs text-gray-400'>
                        ({repository.uniqueAuthorsCount} authors)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Plan Card */}
          <Link
            href={`/workspace/repository/${repository.id}/onboarding`}
            className='block h-full'
          >
            <Card className='h-full transition-all hover:shadow-md flex flex-col'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-lg'>Onboarding</CardTitle>
              </CardHeader>
              <CardContent className='flex-grow flex items-center'>
                <div className='flex items-center'>
                  <BookOpen className='h-5 w-5 mr-3 text-amber-500' />
                  <div>
                    <p className='text-lg font-medium'>Onboarding Plan</p>
                    <p className='text-sm text-gray-500'>AI-generated guide</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Wide Sync Status Card (spans 2 columns) */}
          <div className='md:col-span-2 h-full'>
            <SyncStatusCard />
          </div>
        </div>

        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Repository Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                      ? formatDistanceToNow(
                          new Date(repository.last_analyzed),
                          {
                            addSuffix: true,
                          }
                        )
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
                    {repository.status === "ready"
                      ? "Ready"
                      : repository.status}
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

        {/* Repository Chat Interface */}
        <RepositoryChat
          repositoryId={repository.id}
          repositoryName={repository.name}
        />
      </div>
    </div>
  );
}
