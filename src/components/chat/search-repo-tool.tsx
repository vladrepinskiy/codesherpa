"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);

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
          {/* Header with toggle button */}
          <div className='flex justify-between items-center'>
            <div className='flex items-center text-green-600'>
              <Search className='h-4 w-4 mr-1' />
              <span className='text-sm font-medium'>
                Search results for: {toolInvocation.args?.query}
              </span>
            </div>

            {/* Toggle button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='text-gray-500 hover:text-gray-700 focus:outline-none transition-colors'
              aria-expanded={isExpanded}
              aria-label={
                isExpanded ? "Collapse search results" : "Expand search results"
              }
            >
              {isExpanded ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </button>
          </div>

          {/* Results only shown when expanded */}
          {isExpanded && (
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
          )}

          {/* Show a preview when collapsed */}
          {!isExpanded && toolInvocation.result && (
            <div className='mt-1 text-xs text-gray-500 italic truncate'>
              {toolInvocation.result.length > 50
                ? toolInvocation.result.substring(0, 50) + "..."
                : toolInvocation.result}
              <span
                className='text-blue-500 ml-1 cursor-pointer'
                onClick={() => setIsExpanded(true)}
              >
                View details
              </span>
            </div>
          )}
        </div>
      );
  }
}
