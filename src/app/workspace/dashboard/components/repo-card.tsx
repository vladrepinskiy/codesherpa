import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Repository } from "@/types/repository";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface RepositoryCardProps {
  repository: Repository & {
    isFavorite?: boolean;
    lastAccessed?: string | null;
    notes?: string | null;
  };
  onDelete: (id: string) => Promise<void>;
  isProcessing: boolean;
  processingStage?: string;
}

export function RepositoryCard({
  repository,
  onDelete,
  isProcessing,
  processingStage,
}: RepositoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(repository.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        isProcessing ? "border-blue-200 bg-blue-50/30" : ""
      }`}
    >
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-start'>
          <CardTitle className='text-lg truncate'>
            {repository.name}
            {repository.isFavorite && (
              <span className='ml-2 text-yellow-500'>★</span>
            )}
          </CardTitle>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-red-500'
                disabled={isDeleting || isProcessing}
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Repository</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{repository.name}&quot;?
                  This action cannot be undone and will remove all repository
                  data, including files and analysis.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-red-500 hover:bg-red-600'
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent>
        <p className='text-sm text-gray-500 mb-4 line-clamp-2'>
          {repository.description || "No description available"}
        </p>

        <div className='text-xs text-gray-400 mb-4'>
          {isProcessing ? (
            <div className='flex items-center text-blue-500'>
              <Spinner size='sm' className='mr-1' />
              <span>{processingStage || "Processing..."}</span>
            </div>
          ) : repository.status === "ready" ? (
            <span className='text-green-500'>● Ready</span>
          ) : repository.status === "error" ? (
            <span className='text-red-500'>● Error</span>
          ) : (
            <span className='text-yellow-500'>● {repository.status}</span>
          )}
          <span className='ml-2'>
            {repository.stars_count > 0 && `★ ${repository.stars_count}`}
          </span>
        </div>

        {isProcessing ? (
          <div className='w-full p-2 bg-blue-100 rounded-md text-xs text-blue-700 text-center'>
            Processing repository...
          </div>
        ) : repository.status === "ready" ? (
          <Link href={`/workspace/repository/${repository.id}`}>
            <Button variant='outline' size='sm' className='w-full'>
              View Repository
            </Button>
          </Link>
        ) : repository.status === "error" ? (
          <div className='text-xs text-red-500 p-2 bg-red-50 rounded'>
            Error: {repository.error_message || "Unknown error occurred"}
          </div>
        ) : (
          <div className='text-xs text-blue-500 p-2 bg-blue-50 rounded flex items-center justify-center'>
            <Spinner size='sm' className='mr-1' /> Processing repository...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
