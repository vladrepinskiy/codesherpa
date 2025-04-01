"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageCircleQuestion } from "lucide-react";

interface RepositoryNavigationCardsProps {
  repositoryId: string;
}

export function RepositoryNavigationCards({
  repositoryId,
}: RepositoryNavigationCardsProps) {
  return (
    <>
      {/* Onboarding Plan Card */}
      <Link
        href={`/workspace/repository/${repositoryId}/onboarding`}
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
                <p className='text-sm text-gray-500'>
                  Not sure where to start? Have a look at this intelligent
                  overview of first steps.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Chat Navigation Card */}
      <Link
        href={`/workspace/repository/${repositoryId}/chat`}
        className='block h-full'
      >
        <Card className='h-full transition-all hover:shadow-md flex flex-col'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Repository Chat</CardTitle>
          </CardHeader>
          <CardContent className='flex-grow flex items-center'>
            <div className='flex items-center'>
              <MessageCircleQuestion className='min-h-5 min-w-5 mr-3 text-indigo-500' />
              <div>
                <p className='text-lg font-medium'>Chat Interface</p>
                <p className='text-sm text-gray-500'>
                  Have any open questions about the project? Come and chat with
                  your AI assistant.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
