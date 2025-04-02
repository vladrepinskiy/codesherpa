"use client";
import { SearchRepositoryTool } from "./search-repo-tool";

interface ToolInvocationProps {
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

export function ToolInvocation({ toolInvocation, index }: ToolInvocationProps) {
  switch (toolInvocation.toolName) {
    case "searchRepository":
      return (
        <SearchRepositoryTool toolInvocation={toolInvocation} index={index} />
      );

    // Add cases for future tools here

    default:
      return (
        <div className='bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-2'>
          <div className='text-sm font-medium'>
            Tool: {toolInvocation.toolName}
            {toolInvocation.state === "result" && (
              <div className='mt-2 border-t pt-2'>
                <pre className='text-xs overflow-auto'>
                  {toolInvocation.result}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
  }
}
