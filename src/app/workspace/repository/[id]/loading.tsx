import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoadingRepositoryPage() {
  return (
    <div className='container mx-auto py-10 px-4'>
      {/* Repository Header Skeleton */}
      <div className='mb-8'>
        <Button variant='ghost' size='sm' className='mb-4 pointer-events-none'>
          <Skeleton className='h-4 w-24' />
        </Button>

        <div className='flex justify-between items-start mb-6'>
          <div>
            <div className='flex items-center mb-2'>
              <Skeleton className='h-9 w-64' />
              <div className='ml-2 w-6 h-6'></div>
            </div>
            <Skeleton className='h-6 w-56 mb-4' />
            <Skeleton className='h-5 w-3/4' />
          </div>
          <div className='flex items-center'>
            <Skeleton className='h-5 w-28' />
          </div>
        </div>

        {/* First row: Repository Information and Sync Status */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
          {/* Repository Information Card Skeleton */}
          <Card className='h-full flex flex-col'>
            <CardHeader className='pb-2'>
              <CardTitle>
                <Skeleton className='h-6 w-48' />
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-grow'>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  {/* Repository Info Items */}
                  <div>
                    <Skeleton className='h-4 w-12 mb-2' />
                    <Skeleton className='h-5 w-24' />
                  </div>
                  <div>
                    <Skeleton className='h-4 w-24 mb-2' />
                    <div className='flex items-center'>
                      <Skeleton className='h-5 w-16' />
                    </div>
                  </div>
                  <div>
                    <Skeleton className='h-4 w-10 mb-2' />
                    <div className='flex items-center'>
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

          {/* Sync Status Card Skeleton */}
          <Card className='h-full flex flex-col'>
            <CardHeader className='pb-2'>
              <CardTitle>
                <Skeleton className='h-6 w-36' />
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-grow'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <Skeleton className='h-5 w-5 rounded-full mr-2' />
                    <Skeleton className='h-6 w-32' />
                  </div>
                  <Skeleton className='h-9 w-24 rounded-md' />
                </div>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second row: Statistics, Onboarding, Chat */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          {/* Statistics Card Skeleton */}
          <Card className='h-full flex flex-col'>
            <CardHeader className='pb-2'>
              <CardTitle>
                <Skeleton className='h-6 w-20' />
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-grow flex flex-col justify-center'>
              <div className='space-y-4'>
                <div className='flex items-center'>
                  <div>
                    <Skeleton className='h-8 w-12 mb-1' />
                    <Skeleton className='h-4 w-10' />
                  </div>
                </div>
                <div className='flex items-center'>
                  <div>
                    <Skeleton className='h-8 w-12 mb-1' />
                    <div className='flex items-center'>
                      <Skeleton className='h-4 w-20 mr-2' />
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Card Skeleton */}
          <Card className='h-full flex flex-col'>
            <CardHeader className='pb-2'>
              <CardTitle>
                <Skeleton className='h-6 w-24' />
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-grow flex items-center'>
              <div className='flex items-center'>
                <div>
                  <Skeleton className='h-6 w-32 mb-1' />
                  <Skeleton className='h-4 w-full mb-1' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repository Chat Card Skeleton */}
          <Card className='h-full flex flex-col'>
            <CardHeader className='pb-2'>
              <CardTitle>
                <Skeleton className='h-6 w-36' />
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-grow flex items-center'>
              <div className='flex items-center'>
                <div>
                  <Skeleton className='h-6 w-32 mb-1' />
                  <Skeleton className='h-4 w-full mb-1' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
