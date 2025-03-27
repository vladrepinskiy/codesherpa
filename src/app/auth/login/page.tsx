"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "repo read:user user:email", // Request repo access
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("GitHub login error:", error);
      setError("Error logging in with GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl text-center'>
            Welcome to CodeSherpa
          </CardTitle>
          <CardDescription className='text-center'>
            Sign in with GitHub to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-6'>
            <div className='text-sm text-gray-600 bg-blue-50 p-4 rounded-md border border-blue-100'>
              <p className='mb-2'>
                <strong>Why GitHub authentication?</strong>
              </p>
              <p className='mb-2'>
                CodeSherpa requires GitHub authentication to access your
                repositories and provide intelligent code navigation and AI
                assistance for your projects.
              </p>
              <p>
                <strong>Privacy note:</strong> We only request necessary
                permissions. Your GitHub access tokens are not stored by
                CodeSherpa and all access is handled securely through
                GitHub&apos;s OAuth flow.
              </p>
            </div>

            <Button
              type='button'
              variant='outline'
              className='w-full flex items-center justify-center gap-2'
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <svg
                viewBox='0 0 24 24'
                width='16'
                height='16'
                stroke='currentColor'
                strokeWidth='1.5'
                fill='none'
              >
                <path
                  d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z'
                  fill='currentColor'
                />
              </svg>
              {isLoading ? "Signing in..." : "Sign in with GitHub"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
