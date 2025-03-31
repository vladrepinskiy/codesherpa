import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RepositoryLoadingState() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='pb-2'>
              <div className='h-6 bg-gray-200 rounded w-3/4'></div>
            </CardHeader>
            <CardContent>
              <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-5/6 mb-4'></div>
              <div className='h-8 bg-gray-200 rounded w-full'></div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

export function RepositoryErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className='bg-red-50 border-red-200'>
      <CardContent className='pt-6 text-center'>
        <p className='text-red-500 mb-2'>Error loading repositories</p>
        <Button variant='outline' size='sm' onClick={onRetry} className='mt-2'>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export function EmptyRepositoryState() {
  return (
    <Card className='bg-gray-50 border-dashed'>
      <CardContent className='pt-6 text-center'>
        <p className='text-gray-500 mb-2'>No repositories imported yet</p>
        <p className='text-sm text-gray-400 mb-6'>
          Import your first repository using the form above to get started
        </p>
      </CardContent>
    </Card>
  );
}
