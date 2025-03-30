"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, MessageSquare, Send } from "lucide-react";
import { ChatMessage } from "./chat-message";

interface ChatContentProps {
  params: { id: string };
  repository: { name: string; full_name: string };
}

export default function ChatContent({ params, repository }: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `/api/repositories/${params.id}/chat`,
    });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className='container mx-auto py-6 px-4 flex flex-col h-[calc(100vh-4rem)]'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center'>
          <Link href={`/workspace/repository/${params.id}`}>
            <Button variant='ghost' size='sm' className='mr-2'>
              <ChevronLeft className='h-4 w-4 mr-1' />
              Back to Repository
            </Button>
          </Link>
          <h1 className='text-xl font-semibold flex items-center'>
            <MessageSquare className='mr-2 h-5 w-5' />
            Chat with {repository.name}
          </h1>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto mb-4 border rounded-md p-4 bg-gray-50 dark:bg-gray-900'>
        {messages.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center text-gray-400'>
            <MessageSquare className='h-12 w-12 mb-2 opacity-20' />
            <p className='text-center'>
              Ask a question about this repository to get started
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {" "}
            {/* Increased space between messages */}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className='sticky bottom-0 bg-background pb-4'>
        <form onSubmit={handleSubmit} className='flex items-center gap-2'>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder='Type your question...'
            className='flex-1'
            autoFocus
            disabled={isLoading}
          />
          <Button type='submit' disabled={isLoading || !input.trim()}>
            <Send className='h-4 w-4 mr-1' />
            {isLoading ? "Thinking..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
