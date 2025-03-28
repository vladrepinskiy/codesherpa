"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import RepositoryImportForm from "@/components/repository/import-form";
import { Button } from "@/components/ui/button";

const supabase = createClient();

export default function TestImportPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check user on component mount
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "repo read:user user:email", // Request repo access
        },
      });
    } catch (error) {
      console.error("GitHub login error:", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className='container mx-auto py-10 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Test Repository Import</h1>

      {loading && (
        <div className='text-center p-8'>
          <div className='animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4'></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && !user && (
        <div className='max-w-md mx-auto text-center p-8 border rounded-lg'>
          <h2 className='text-xl mb-4'>Authentication Required</h2>
          <p className='mb-6 text-gray-600'>
            You need to sign in with GitHub to import repositories.
          </p>
          <Button
            onClick={handleSignIn}
            className='bg-gray-900 hover:bg-gray-800'
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                d='M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.82-2.34 4.66-4.57 4.91.36.31.68.92.68 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z'
                clipRule='evenodd'
              />
            </svg>
            Sign in with GitHub
          </Button>
        </div>
      )}

      {!loading && user && (
        <div className='max-w-4xl mx-auto'>
          <div className='bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center'>
            <div>
              <p className='text-sm text-gray-600'>Signed in as</p>
              <p className='font-medium'>{user.email}</p>
            </div>
            <Button variant='outline' onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <div className='mb-8'>
            <p className='text-lg mb-4'>
              This page lets you test the repository import functionality:
            </p>
            <ul className='list-disc pl-6 space-y-2 text-gray-700'>
              <li>Enter a GitHub repository URL to import it</li>
              <li>The system will clone, analyze, and index the repository</li>
              <li>
                You&apos;ll see real-time status updates as the process runs
              </li>
              <li>
                When complete, you can explore the repository with AI assistance
              </li>
            </ul>
          </div>

          <RepositoryImportForm />
        </div>
      )}
    </div>
  );
}
