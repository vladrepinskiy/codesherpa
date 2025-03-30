"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, MessageSquare, Send, Bot, User } from "lucide-react";

// Update the Message interface to include source information
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  id: string;
  visible: boolean;
  sources?: {
    type: string;
    path: string;
    content?: string;
    url?: string;
  }[];
}

interface ChatContentProps {
  params: { id: string };
  repository: { name: string; full_name: string };
}

export default function ChatContent({ params, repository }: ChatContentProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a unique ID for every message
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Initialize with the query from the URL if available
  useEffect(() => {
    if (initialQuery && !isInitialized) {
      setIsInitialized(true);
      setCurrentInput(initialQuery);

      // Add user message with visible:false initially
      const userMessageId = generateId();
      const userMessage: Message = {
        role: "user",
        content: initialQuery,
        timestamp: new Date(),
        id: userMessageId,
        visible: false,
      };

      setMessages([userMessage]);

      // Set visible to true after a brief delay to trigger the transition
      setTimeout(() => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          if (updatedMessages.length > 0) {
            updatedMessages[0] = { ...updatedMessages[0], visible: true };
          }
          return updatedMessages;
        });
      }, 10);

      // Simulate an API response
      setTimeout(() => {
        const aiMessageId = generateId();
        const aiMessage: Message = {
          role: "assistant",
          content: `I'll help you find information about "${initialQuery}" in the ${repository.name} repository.`,
          timestamp: new Date(),
          id: aiMessageId,
          visible: false,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Set visible to true after a brief delay to trigger the transition
        setTimeout(() => {
          setMessages((prev) => {
            const updatedMessages = [...prev];
            if (updatedMessages.length > 0) {
              const lastIndex = updatedMessages.length - 1;
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                visible: true,
              };
            }
            return updatedMessages;
          });
        }, 10);
      }, 1000);
    }
  }, [initialQuery, repository.name, isInitialized]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentInput.trim()) return;

    // Add user message initially with visible:false
    const userMessageId = generateId();
    const newUserMessage: Message = {
      role: "user",
      content: currentInput,
      timestamp: new Date(),
      id: userMessageId,
      visible: false,
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Set visible to true after a brief delay to trigger the transition
    setTimeout(() => {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        if (updatedMessages.length > 0) {
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            visible: true,
          };
        }
        return updatedMessages;
      });
    }, 10);

    setCurrentInput("");

    // Add a loading message
    const loadingMessageId = generateId();
    const loadingMessage: Message = {
      role: "assistant",
      content: "Searching repository...",
      timestamp: new Date(),
      id: loadingMessageId,
      visible: false,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    // Make loading message visible
    setTimeout(() => {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        if (updatedMessages.length > 0) {
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            visible: true,
          };
        }
        return updatedMessages;
      });
    }, 10);

    try {
      // Call our API endpoint
      const response = await fetch(`/api/repositories/${params.id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: currentInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results;

      // Replace loading message with actual results
      const aiMessageId = generateId();

      // Format the response message
      const responseContent = `Here's what I found about "${currentInput}" in the ${repository.name} repository:\n\n`;

      // Create a list of sources from the results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sources = results.slice(0, 5).map((result: any) => ({
        type: result.type,
        path: result.metadata.path,
        content: result.content.substring(0, 200) + "...", // Preview of content
        url: result.type === "discussion" ? result.metadata.url : undefined,
      }));

      const aiMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        id: aiMessageId,
        visible: false,
        sources: sources,
      };

      // Replace the loading message with our results
      setMessages((prev) => {
        const updatedMessages = [...prev];
        // Replace the last message (loading message) with our results
        updatedMessages[updatedMessages.length - 1] = aiMessage;
        return updatedMessages;
      });

      // Make the new message visible
      setTimeout(() => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            visible: true,
          };
          return updatedMessages;
        });
      }, 10);
    } catch (error) {
      console.error("Error fetching chat response:", error);

      // Replace loading message with error message
      const errorMessageId = generateId();
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while searching the repository. Please try again.",
        timestamp: new Date(),
        id: errorMessageId,
        visible: false,
      };

      setMessages((prev) => {
        const updatedMessages = [...prev];
        // Replace the last message (loading message) with our error message
        updatedMessages[updatedMessages.length - 1] = errorMessage;
        return updatedMessages;
      });

      // Make the error message visible
      setTimeout(() => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            visible: true,
          };
          return updatedMessages;
        });
      }, 10);
    }
  };

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
          <div className='space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-3/4 rounded-lg p-3 transition-opacity duration-500
                  ${message.visible ? "opacity-100" : "opacity-0"}
                  ${
                    message.role === "assistant"
                      ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <div className='flex items-center mb-1'>
                    {message.role === "assistant" ? (
                      <Bot className='h-4 w-4 mr-1' />
                    ) : (
                      <User className='h-4 w-4 mr-1' />
                    )}
                    <span className='text-xs opacity-75'>
                      {message.role === "assistant" ? "AI Assistant" : "You"}
                    </span>
                  </div>
                  <p>{message.content}</p>
                  {/* Display sources if available */}
                  {message.sources && message.sources.length > 0 && (
                    <div className='mt-2 border-t pt-2 text-sm'>
                      <div className='font-medium mb-1'>Sources:</div>
                      <div className='space-y-2'>
                        {message.sources.map((source, index) => (
                          <div
                            key={index}
                            className='bg-gray-100 dark:bg-gray-700 p-2 rounded'
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <span className='font-mono text-xs'>
                                {source.type === "code"
                                  ? "File:"
                                  : "Discussion:"}{" "}
                                {source.path}
                              </span>
                              {source.url && (
                                <a
                                  href={source.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-500 hover:underline text-xs'
                                >
                                  View
                                </a>
                              )}
                            </div>
                            {source.content && (
                              <pre className='text-xs overflow-x-auto whitespace-pre-wrap'>
                                {source.content}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className='sticky bottom-0 bg-background pb-4'>
        <form onSubmit={handleSubmit} className='flex items-center gap-2'>
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder='Type your question...'
            className='flex-1'
            autoFocus
          />
          <Button type='submit' disabled={!currentInput.trim()}>
            <Send className='h-4 w-4 mr-1' />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
