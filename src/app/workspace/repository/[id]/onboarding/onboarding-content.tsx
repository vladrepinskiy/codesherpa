"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, BookOpen, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OnboardingContentProps {
  params: { id: string };
  repository: { name: string; full_name: string };
}

export default function OnboardingContent({
  params,
  repository,
}: OnboardingContentProps) {
  return (
    <div className='container mx-auto py-10 px-4'>
      <Link href={`/workspace/repository/${params.id}`}>
        <Button variant='ghost' size='sm' className='mb-4'>
          <ChevronLeft className='mr-1 h-4 w-4' /> Back to Repository
        </Button>
      </Link>

      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2 flex items-center'>
          <BookOpen className='mr-2 h-6 w-6 text-amber-500' />
          Onboarding Plan for {repository.name}
        </h1>
        <p className='text-gray-600'>
          AI-generated guide to help you understand and contribute to this
          repository
        </p>
      </div>

      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid grid-cols-4 mb-6'>
          <TabsTrigger value='overview'>Get Overview</TabsTrigger>
          <TabsTrigger value='structure'>Review Structure</TabsTrigger>
          <TabsTrigger value='setup'>Get Set Up</TabsTrigger>
          <TabsTrigger value='concepts'>Contribute</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className='pt-6'>
            <TabsContent value='overview' className='space-y-6'>
              <section>
                <h3 className='text-lg font-medium mb-2'>Project Overview</h3>
                <p className='text-gray-700 mb-4'>
                  This is an AI-generated overview of the {repository.name}{" "}
                  repository based on documentation files, README, and other
                  repository content.
                </p>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>
                      Generating onboarding content from repository
                      documentation...
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className='text-lg font-medium mb-2'>Project Goals</h3>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>Analyzing repository goals and purpose...</span>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value='structure' className='space-y-6'>
              <section>
                <h3 className='text-lg font-medium mb-2'>
                  Repository Structure
                </h3>
                <p className='text-gray-700 mb-4'>
                  Understanding how the codebase is organized will help you
                  navigate and contribute effectively.
                </p>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>Analyzing repository structure...</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className='text-lg font-medium mb-2'>
                  Key Files and Directories
                </h3>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>Identifying important files and directories...</span>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value='setup' className='space-y-6'>
              <section>
                <h3 className='text-lg font-medium mb-2'>Prerequisites</h3>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>Identifying dependencies and requirements...</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className='text-lg font-medium mb-2'>Installation Steps</h3>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>
                      Extracting setup instructions from documentation...
                    </span>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value='concepts' className='space-y-6'>
              <section>
                <h3 className='text-lg font-medium mb-2'>Contribute</h3>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>Searching for contribution guidelines...</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className='text-lg font-medium mb-2'>Where Can I Start?</h3>

                {/* Placeholder for AI-generated content */}
                <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
                  <div className='flex items-center justify-center p-6 text-gray-500'>
                    <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                    <span>Working on good first issue ideas...</span>
                  </div>
                </div>
              </section>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
