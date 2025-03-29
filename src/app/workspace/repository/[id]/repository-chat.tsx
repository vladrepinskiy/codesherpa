"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare } from "lucide-react";

interface RepositoryChatProps {
  repositoryId: string;
  repositoryName: string;
}

export default function RepositoryChat({
  repositoryId,
  repositoryName,
}: RepositoryChatProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Redirect to the chat page with the query as a parameter
      router.push(
        `/workspace/repository/${repositoryId}/chat?q=${encodeURIComponent(
          query.trim()
        )}`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <MessageSquare className='mr-2 h-5 w-5' />
          Ask anything about this repository
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask questions or search the repository ${repositoryName}`}
              className='pl-10'
            />
          </div>
          <Button type='submit' disabled={!query.trim()}>
            Ask
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
