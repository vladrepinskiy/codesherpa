"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageCircle } from "lucide-react";

interface RepositoryStatisticsCardProps {
  filesCount: number;
  discussionsCount: number;
  uniqueAuthorsCount: number;
}

export function RepositoryStatisticsCard(props: RepositoryStatisticsCardProps) {
  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg'>Statistics</CardTitle>
      </CardHeader>
      <CardContent className='flex-grow flex flex-col justify-center'>
        <div className='space-y-4'>
          <div className='flex items-center'>
            <FileText className='h-5 w-5 mr-3 text-blue-500' />
            <div>
              <p className='text-2xl font-bold'>{props.filesCount}</p>
              <p className='text-sm text-gray-500'>Files</p>
            </div>
          </div>
          <div className='flex items-center'>
            <MessageCircle className='h-5 w-5 mr-3 text-purple-500' />
            <div>
              <p className='text-2xl font-bold'>{props.discussionsCount}</p>
              <p className='text-sm text-gray-500'>
                Discussions
                <span className='ml-2 text-xs text-gray-400'>
                  ({props.uniqueAuthorsCount} authors)
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
