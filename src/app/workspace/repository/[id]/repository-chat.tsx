"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUp, MessageSquare, X } from "lucide-react";

interface RepositoryChatProps {
  repositoryId: string;
  repositoryName: string;
}

export default function RepositoryChat({
  repositoryId,
  repositoryName,
}: RepositoryChatProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle expanding the chat interface
  const handleExpand = () => {
    setExpanded(true);
    // Focus the input after expanding
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300); // Wait for animation to finish
  };

  console.log(repositoryId);

  // Handle collapsing the chat interface
  const handleCollapse = () => {
    setExpanded(false);
    setQuery("");
  };

  // Scroll to center the chat when expanded
  useEffect(() => {
    if (expanded && containerRef.current) {
      const yOffset = -50; // Adjust as needed
      const y =
        containerRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [expanded]);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-500 ease-in-out ${
        expanded
          ? "fixed inset-0 bg-background/95 z-50 p-6 flex flex-col items-center justify-center"
          : ""
      }`}
    >
      <Card
        className={`w-full transition-all duration-300 ${
          expanded ? "max-w-4xl" : ""
        }`}
      >
        {expanded && (
          <div className='absolute top-4 right-4'>
            <Button variant='ghost' size='icon' onClick={handleCollapse}>
              <X className='h-5 w-5' />
            </Button>
          </div>
        )}

        <CardHeader>
          <CardTitle className='flex items-center'>
            <MessageSquare className='mr-2 h-5 w-5' />
            {expanded
              ? `Chat with ${repositoryName}`
              : "Ask anything about this repository"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!expanded ? (
            <div
              className='flex items-center cursor-pointer border rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
              onClick={handleExpand}
            >
              <Search className='h-5 w-5 text-gray-400 mr-2' />
              <span className='text-gray-500'>
                Ask questions or search the repository...
              </span>
            </div>
          ) : (
            <div className='space-y-4'>
              <p className='text-sm text-gray-500'>
                Chat with this repository to explore code, documentation, and
                discussions. Ask anything from setup instructions to
                implementation details.
              </p>

              <div className='chat-history min-h-[300px] max-h-[60vh] overflow-y-auto border rounded-md p-4'>
                {/* Chat history would appear here */}
                <div className='flex justify-center items-center h-full text-gray-400'>
                  <p>Start a conversation with this repository</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Ask a question...'
                  className='flex-1'
                />
                <Button type='submit' size='icon'>
                  <ArrowUp className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
