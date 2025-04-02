"use client";

import { Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

interface SearchRepositoryToolProps {
  toolInvocation: {
    toolName: string;
    toolCallId: string;
    state: "partial-call" | "call" | "result";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any;
    result?: string;
  };
  index: number;
}

export function SearchRepositoryTool({
  toolInvocation,
  index,
}: SearchRepositoryToolProps) {
  switch (toolInvocation.state) {
    case "partial-call":
      return (
        <div
          key={`tool-${index}`}
          className='bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-2'
        >
          <div className='flex items-center text-blue-500'>
            <Search className='h-4 w-4 mr-1' />
            <span className='text-sm font-medium'>Searching repository...</span>
          </div>
        </div>
      );

    case "call":
      return (
        <div
          key={`tool-${index}`}
          className='bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-2'
        >
          <div className='flex items-center text-blue-500'>
            <Search className='h-4 w-4 mr-1' />
            <span className='text-sm font-medium'>
              Searching for: {toolInvocation.args?.query}
            </span>
          </div>
        </div>
      );

    case "result":
      return (
        <div
          key={`tool-${index}`}
          className='bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-3 mt-2'
        >
          <div className='flex items-center text-green-600 mb-1'>
            <Search className='h-4 w-4 mr-1' />
            <span className='text-sm font-medium'>
              Search results for: {toolInvocation.args?.query}
            </span>
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 pt-2 mt-1'>
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                code: ({ className, ...props }) => {
                  if (className) {
                    return <code className={className} {...props} />;
                  }
                  return (
                    <code
                      className='px-1.5 py-0.5 mx-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs'
                      {...props}
                    />
                  );
                },
                pre: (props) => (
                  <pre
                    className='my-2 rounded-md overflow-x-auto text-xs'
                    {...props}
                  />
                ),
              }}
            >
              {toolInvocation.result || "No results found"}
            </ReactMarkdown>
          </div>
        </div>
      );
  }
}
