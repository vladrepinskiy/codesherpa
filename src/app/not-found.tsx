import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function NotFound() {
  // Check if user is authenticated
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    // Fall back to unauthenticated if there's an error
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-white text-black p-8'>
      <main className='max-w-4xl w-full flex flex-col items-center text-center'>
        <h1 className='text-5xl font-bold mb-6'>Page Not Found 🏔️</h1>

        <p className='text-xl mb-10 max-w-2xl'>
          It seems you&apos;ve wandered off the trail. The page you&apos;re
          looking for couldn&apos;t be found.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 w-full max-w-2xl'>
          {/* Dashboard Card - Only show for authenticated users */}
          {isAuthenticated && (
            <div className='border border-gray-200 rounded-lg p-6 flex flex-col items-center h-[200px] justify-between'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Return to Dashboard
                </h3>
                <p className='text-sm text-gray-700 h-[60px] line-clamp-3'>
                  Head back to your CodeSherpa dashboard to continue exploring
                  your coding journey.
                </p>
              </div>
              <Link href='/workspace/dashboard'>
                <Button variant='outline'>Go to Dashboard</Button>
              </Link>
            </div>
          )}

          {/* Login Card - Only show for unauthenticated users */}
          {!isAuthenticated && (
            <div className='border border-gray-200 rounded-lg p-6 flex flex-col items-center h-[200px] justify-between'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>Sign In</h3>
                <p className='text-sm text-gray-700 h-[60px] line-clamp-3'>
                  Sign in to your CodeSherpa account to access the dashboard and
                  your projects.
                </p>
              </div>
              <Link href='/auth/login'>
                <Button variant='outline'>Sign In</Button>
              </Link>
            </div>
          )}

          {/* Homepage Card - Always show */}
          <div className='border border-gray-200 rounded-lg p-6 flex flex-col items-center h-[200px] justify-between'>
            <div>
              <h3 className='text-lg font-semibold mb-2'>Visit Homepage</h3>
              <p className='text-sm text-gray-700 h-[60px] line-clamp-3'>
                Check out our main page to learn more about CodeSherpa and how
                it can help you navigate complex codebases.
              </p>
            </div>
            <Link href='/'>
              <Button variant='outline'>Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
