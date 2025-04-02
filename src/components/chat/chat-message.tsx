"use client";

import { Bot, User, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system" | "data";
    content: string;
    parts?: Array<{
      type: string;
      text?: string;
      toolInvocation?: {
        toolName: string;
        toolCallId: string;
        state: "partial-call" | "call" | "result";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args?: any;
        result?: string;
      };
    }>;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  // If the message has parts, it might contain tool calls
  const hasParts = message.parts && message.parts.length > 0;

  return (
    <div
      className={`flex ${
        message.role === "assistant" ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`max-w-3/4 rounded-lg p-3
          ${
            message.role === "assistant"
              ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              : "bg-blue-500 text-white"
          }`}
      >
        <div className='flex items-center mb-2'>
          {message.role === "assistant" ? (
            <Bot className='h-4 w-4 mr-1' />
          ) : (
            <User className='h-4 w-4 mr-1' />
          )}
          <span className='text-xs opacity-75'>
            {message.role === "assistant" ? "AI Assistant" : "You"}
          </span>
        </div>

        {message.role === "assistant" ? (
          hasParts ? (
            // Render parts when available
            <div className='prose dark:prose-invert prose-sm max-w-none'>
              {message.parts!.map((part, index) => {
                switch (part.type) {
                  case "step-start":
                    return index > 0 ? (
                      <div key={`step-${index}`} className='text-gray-500'>
                        <hr className='my-2 border-gray-300' />
                      </div>
                    ) : null;

                  case "text":
                    return (
                      <div key={`text-${index}`}>
                        <ReactMarkdown
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            // All the existing component customizations
                            p: (props) => (
                              <p className='mb-4 leading-relaxed' {...props} />
                            ),
                            h1: (props) => (
                              <h1
                                className='mt-6 mb-3 text-xl font-semibold'
                                {...props}
                              />
                            ),
                            h2: (props) => (
                              <h2
                                className='mt-5 mb-3 text-lg font-semibold'
                                {...props}
                              />
                            ),
                            h3: (props) => (
                              <h3
                                className='mt-4 mb-2 text-base font-semibold'
                                {...props}
                              />
                            ),
                            ul: (props) => (
                              <ul className='my-3 pl-6 list-disc' {...props} />
                            ),
                            ol: (props) => (
                              <ol
                                className='my-3 pl-6 list-decimal'
                                {...props}
                              />
                            ),
                            li: (props) => <li className='mb-2' {...props} />,
                            blockquote: (props) => (
                              <blockquote
                                className='pl-4 my-4 border-l-4 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                                {...props}
                              />
                            ),
                            code: ({ className, ...props }) => {
                              if (className) {
                                return (
                                  <code className={className} {...props} />
                                );
                              }
                              return (
                                <code
                                  className='px-1.5 py-0.5 mx-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-sm'
                                  {...props}
                                />
                              );
                            },
                            pre: (props) => (
                              <pre
                                className='my-4 rounded-md overflow-x-auto'
                                {...props}
                              />
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
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    );

                  case "tool-invocation":
                    const toolInvocation = part.toolInvocation;
                    if (toolInvocation?.toolName === "searchRepository") {
                      switch (toolInvocation.state) {
                        case "partial-call":
                          return (
                            <div
                              key={`tool-${index}`}
                              className='bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-2'
                            >
                              <div className='flex items-center text-blue-500'>
                                <Search className='h-4 w-4 mr-1' />
                                <span className='text-sm font-medium'>
                                  Searching repository...
                                </span>
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
                                  Search results for:{" "}
                                  {toolInvocation.args?.query}
                                </span>
                              </div>
                              <div className='text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 pt-2 mt-1'>
                                <ReactMarkdown
                                  rehypePlugins={[rehypeHighlight]}
                                  components={{
                                    // Same component customizations as above
                                    code: ({ className, ...props }) => {
                                      if (className) {
                                        return (
                                          <code
                                            className={className}
                                            {...props}
                                          />
                                        );
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
                    return null;

                  default:
                    return null;
                }
              })}
            </div>
          ) : (
            // Default rendering for backward compatibility
            <div className='prose dark:prose-invert prose-sm max-w-none'>
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // All the existing component customizations from the original file
                  p: (props) => (
                    <p className='mb-4 leading-relaxed' {...props} />
                  ),
                  // ... rest of the components
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          <p className='whitespace-pre-wrap text-white'>{message.content}</p>
        )}
      </div>
    </div>
  );
}
