"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink, Star } from "lucide-react";
import { EnrichedRepository } from "@/types/repository";

interface RepositoryHeaderProps {
  repository: EnrichedRepository;
}

export function RepositoryHeader({ repository }: RepositoryHeaderProps) {
  return (
    <div className='mb-8'>
      <Link href='/workspace/dashboard'>
        <Button variant='ghost' size='sm' className='mb-4'>
          <ChevronLeft className='mr-1 h-4 w-4' /> Back to Dashboard
        </Button>
      </Link>

      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2 flex items-center'>
            {repository.name}
            {repository.isFavorite && (
              <span className='ml-2 text-yellow-500'>
                <Star className='h-6 w-6 fill-current' />
              </span>
            )}
          </h1>
          <p className='text-lg text-gray-600'>{repository.full_name}</p>
          {repository.description && (
            <p className='mt-4 text-gray-700'>{repository.description}</p>
          )}
        </div>

        <a
          href={`https://github.com/${repository.full_name}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:text-blue-800 flex items-center'
        >
          <ExternalLink className='mr-1 h-4 w-4' /> View on GitHub
        </a>
      </div>
    </div>
  );
}
