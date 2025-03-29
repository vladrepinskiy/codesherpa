import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  FileText,
  MessageCircle,
  BookOpen,
  Star,
  GitBranch,
} from "lucide-react";

export default function LoadingRepositoryPage() {
  return (
    <div className='container mx-auto py-10 px-4'>
      <div className='mb-8'>
        {/* Match the exact Button styling */}
        <Button variant='ghost' size='sm' className='mb-4 pointer-events-none'>
          <ChevronLeft className='mr-1 h-4 w-4 text-muted-foreground blur-3xl' />
          <Skeleton className='h-4 w-24' />
        </Button>

        <div className='flex justify-between items-start mb-6'>
          <div>
            <div className='flex items-center mb-2'>
              <Skeleton className='h-9 w-64' />
              <div className='ml-2 w-6 h-6'>
                <Skeleton className='h-6 w-6 rounded-full' />
              </div>
            </div>
            <Skeleton className='h-6 w-56 mb-4' />
            <Skeleton className='h-5 w-3/4' />
          </div>
          <Skeleton className='h-9 w-36 rounded-md' /> {/* GitHub link */}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          {/* Files Card */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <FileText className='h-5 w-5 mr-2 text-blue-500 opacity-70 blur-2xl' />
                <div>
                  <Skeleton className='h-8 w-12 mb-1' />
                  <Skeleton className='h-4 w-10' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discussions Card */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <MessageCircle className='h-5 w-5 mr-2 text-purple-500 opacity-70 blur-2xl' />
                <div>
                  <Skeleton className='h-8 w-12 mb-1' />
                  <div>
                    <Skeleton className='h-4 w-20 mb-1' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Card */}
          <Card className='h-full'>
            <CardContent className='pt-6 h-full'>
              <div className='flex items-center h-full'>
                <BookOpen className='h-5 w-5 mr-2 text-amber-500 opacity-70 blur-2xl' />
                <div>
                  <Skeleton className='h-6 w-32 mb-1' />
                  <Skeleton className='h-4 w-28' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Status Card */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <Skeleton className='h-5 w-5 rounded-full mr-2' />
                  <div>
                    <Skeleton className='h-6 w-24 mb-1' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                </div>
                <Skeleton className='h-8 w-20 rounded-md' />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>
              <Skeleton className='h-6 w-48' />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* Repository Info Items */}
                <div>
                  <Skeleton className='h-4 w-12 mb-2' />
                  <Skeleton className='h-5 w-24' />
                </div>
                <div>
                  <Skeleton className='h-4 w-24 mb-2' />
                  <div className='flex items-center'>
                    <GitBranch className='h-4 w-4 mr-1 text-green-500 opacity-70 blur-2xl' />
                    <Skeleton className='h-5 w-16' />
                  </div>
                </div>
                <div>
                  <Skeleton className='h-4 w-10 mb-2' />
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 mr-1 text-yellow-500 opacity-70 blur-2xl' />
                    <Skeleton className='h-5 w-8' />
                  </div>
                </div>
                <div>
                  <Skeleton className='h-4 w-24 mb-2' />
                  <Skeleton className='h-5 w-36' />
                </div>
                <div>
                  <Skeleton className='h-4 w-14 mb-2' />
                  <Skeleton className='h-5 w-16' />
                </div>
                <div>
                  <Skeleton className='h-4 w-14 mb-2' />
                  <Skeleton className='h-5 w-16' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repository Chat Interface Skeleton */}
        <Card>
          <CardHeader>
            <div className='flex items-center'>
              <MessageCircle className='mr-2 h-5 w-5 text-muted-foreground blur-2xl' />
              <Skeleton className='h-6 w-64' />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className='h-32 w-full mb-4 rounded-md' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-10 flex-1 rounded-md' />
              <Skeleton className='h-10 w-20 rounded-md' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
