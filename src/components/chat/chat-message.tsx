"use client";

import { Bot, User } from "lucide-react";
import { MessageText } from "./message-text";
import { ToolInvocation } from "./tool-invocation";

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
                        <MessageText content={part.text || ""} />
                      </div>
                    );

                  case "tool-invocation":
                    return part.toolInvocation ? (
                      <ToolInvocation
                        key={`tool-${index}`}
                        toolInvocation={part.toolInvocation}
                        index={index}
                      />
                    ) : null;

                  default:
                    return null;
                }
              })}
            </div>
          ) : (
            // Default rendering for backward compatibility
            <MessageText content={message.content} />
          )
        ) : (
          <p className='whitespace-pre-wrap text-white'>{message.content}</p>
        )}
      </div>
    </div>
  );
}
