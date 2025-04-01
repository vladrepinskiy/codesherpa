"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, BookOpen, Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOnboardingContent } from "@/hooks/use-onboarding-content";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

interface OnboardingContentProps {
  params: { id: string };
  repository: { name: string; full_name: string };
}

export default function OnboardingContent({
  params,
  repository,
}: OnboardingContentProps) {
  const { content, isLoading, generateContent } = useOnboardingContent(
    params.id
  );

  // Handle tab change
  const handleTabChange = (tab: string) => {
    if (!content[tab] && !isLoading[tab]) {
      generateContent(tab);
    }
  };

  // Pre-load the overview tab on first render
  useEffect(() => {
    if (!content["overview"] && !isLoading["overview"]) {
      generateContent("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render content for a specific tab
  const renderTabContent = (tab: string) => {
    if (isLoading[tab]) {
      return (
        <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border'>
          <div className='flex flex-col items-center justify-center p-6 text-gray-500'>
            <Loader2 className='h-6 w-6 mb-2 animate-spin' />
            <span>Generating onboarding content...</span>
            <p className='text-sm mt-2'>
              This may take a minute as we analyze the repository.
            </p>
          </div>
        </div>
      );
    }

    if (content[tab]) {
      return (
        <div className='prose dark:prose-invert prose-sm max-w-none'>
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Add Tailwind classes to elements for better spacing - mirroring chat-message.tsx
              p: (props) => <p className='mb-4 leading-relaxed' {...props} />,

              h1: (props) => (
                <h1 className='mt-6 mb-3 text-xl font-semibold' {...props} />
              ),

              h2: (props) => (
                <h2 className='mt-5 mb-3 text-lg font-semibold' {...props} />
              ),

              h3: (props) => (
                <h3 className='mt-4 mb-2 text-base font-semibold' {...props} />
              ),

              ul: (props) => <ul className='my-3 pl-6 list-disc' {...props} />,

              ol: (props) => (
                <ol className='my-3 pl-6 list-decimal' {...props} />
              ),

              li: (props) => <li className='mb-2' {...props} />,

              blockquote: (props) => (
                <blockquote
                  className='pl-4 my-4 border-l-4 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  {...props}
                />
              ),

              code: ({ className, ...props }) => {
                // Keep the normal code block styling for multi-line code
                if (className) {
                  return <code className={className} {...props} />;
                }
                // Add style for inline code
                return (
                  <code
                    className='px-1.5 py-0.5 mx-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-sm'
                    {...props}
                  />
                );
              },

              pre: (props) => (
                <pre className='my-4 rounded-md overflow-x-auto' {...props} />
              ),

              table: (props) => (
                <div className='overflow-x-auto my-4'>
                  <table
                    className='min-w-full divide-y divide-gray-300 dark:divide-gray-700'
                    {...props}
                  />
                </div>
              ),

              th: (props) => (
                <th
                  className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800'
                  {...props}
                />
              ),

              td: (props) => (
                <td
                  className='px-3 py-2 border-t border-gray-200 dark:border-gray-800'
                  {...props}
                />
              ),

              hr: (props) => (
                <hr
                  className='my-6 border-gray-200 dark:border-gray-800'
                  {...props}
                />
              ),

              a: (props) => (
                <a
                  className='text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline'
                  {...props}
                />
              ),
            }}
          >
            {content[tab]}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-dashed'>
        <div className='flex flex-col items-center justify-center p-6 text-gray-500'>
          <p className='mb-4'>No content available yet.</p>
          <Button
            variant='outline'
            onClick={() => generateContent(tab)}
            className='flex items-center'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Generate Content
          </Button>
        </div>
      </div>
    );
  };

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

      <Tabs
        defaultValue='overview'
        className='w-full'
        onValueChange={handleTabChange}
      >
        <TabsList className='grid grid-cols-4 mb-6'>
          <TabsTrigger value='overview'>Get Overview</TabsTrigger>
          <TabsTrigger value='structure'>Review Structure</TabsTrigger>
          <TabsTrigger value='setup'>Get Set Up</TabsTrigger>
          <TabsTrigger value='contribute'>Contribute</TabsTrigger>
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
                {renderTabContent("overview")}
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
                {renderTabContent("structure")}
              </section>
            </TabsContent>

            <TabsContent value='setup' className='space-y-6'>
              <section>
                <h3 className='text-lg font-medium mb-2'>Getting Set Up</h3>
                <p className='text-gray-700 mb-4'>
                  Follow these instructions to set up your development
                  environment and run the project locally.
                </p>
                {renderTabContent("setup")}
              </section>
            </TabsContent>

            <TabsContent value='contribute' className='space-y-6'>
              <section>
                <h3 className='text-lg font-medium mb-2'>Contributing Guide</h3>
                <p className='text-gray-700 mb-4'>
                  Learn how to contribute effectively to this repository and
                  understand the contribution workflow.
                </p>
                {renderTabContent("contribute")}
              </section>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
