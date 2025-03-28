"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useRepositoryContext } from "./repos-context";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function RepositoryImportForm() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    repositoryId: string | null;
    status: string | null;
    currentStage: string | null;
    errorMessage: string | null;
    timestamp?: number; // Add timestamp for tracking staleness
  }>({
    repositoryId: null,
    status: null,
    currentStage: null,
    errorMessage: null,
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  const router = useRouter();
  const { triggerRefresh } = useRepositoryContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl) return;

    setLoading(true);
    setError(null);

    // Show immediate feedback that we're starting
    setImportStatus({
      repositoryId: null,
      status: "started",
      currentStage: "Initiating repository import...",
      errorMessage: null,
    });

    try {
      const response = await fetch("/api/repositories/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for token expiration
        if (
          data.code === "GITHUB_TOKEN_EXPIRED" ||
          (data.error && data.error.includes("GitHub token"))
        ) {
          setSessionExpired(true);
          setImportStatus({
            repositoryId: null,
            status: "error",
            currentStage: "Pulling repository",
            errorMessage: "Github access token expired",
          });
          return;
        }
        throw new Error(data.error || "Failed to import repository");
      }

      // Import is already complete, set status to ready
      setImportStatus({
        repositoryId: data.repositoryId,
        status: "ready",
        currentStage: "Import complete!",
        errorMessage: null,
      });

      // Refresh repository list
      triggerRefresh();
    } catch (error) {
      console.error("Import error:", error);
      setError((error as Error).message || "An unexpected error occurred");
      setImportStatus({
        repositoryId: null,
        status: "error",
        currentStage: null,
        errorMessage: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to reset the form and start over
  const resetForm = () => {
    setRepoUrl("");
    setError(null);
    setImportStatus({
      repositoryId: null,
      status: null,
      currentStage: null,
      errorMessage: null,
    });
  };

  // Handle logout for session expiration
  const handleReauthenticate = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
      window.location.href = "/auth/login";
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto overflow-hidden'>
      <CardHeader>
        <CardTitle>Import GitHub Repository</CardTitle>
      </CardHeader>

      <CardContent className='transition-all duration-300 ease-in-out'>
        {error && (
          <Alert
            variant='destructive'
            className='mb-4 animate-in fade-in duration-300'
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          className={`transition-opacity duration-300 ${
            importStatus.status
              ? "opacity-100"
              : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          {importStatus.status && (
            <div className='space-y-4 animate-in slide-in-from-bottom duration-300'>
              <div className='flex items-center space-x-4 p-5 bg-gray-50 rounded-lg border transition-all duration-300'>
                {importStatus.status === "ready" ? (
                  <CheckCircle className='h-8 w-8 text-green-500' />
                ) : importStatus.status === "error" ? (
                  <AlertCircle className='h-8 w-8 text-red-500' />
                ) : (
                  <Spinner size='md' className='text-blue-500' />
                )}

                <div className='flex-1'>
                  <p className='font-medium text-lg'>
                    {importStatus.status === "ready"
                      ? "Import complete!"
                      : importStatus.status === "error"
                      ? "Import failed"
                      : "Importing repository..."}
                  </p>
                  <p className='text-sm text-gray-500 mt-1'>
                    {importStatus.currentStage || "Processing..."}
                  </p>
                  {importStatus.errorMessage && (
                    <p className='text-sm text-red-500 mt-2'>
                      {importStatus.errorMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                {importStatus.status === "ready" && (
                  <>
                    <Button
                      onClick={() =>
                        router.push(
                          `/workspace/repository/${importStatus.repositoryId}`
                        )
                      }
                      className='flex-1 transition duration-200 hover:translate-y-[-2px]'
                    >
                      View Repository
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant='outline'
                      className='flex items-center gap-1 transition duration-200 hover:bg-gray-100'
                    >
                      <ArrowLeft className='h-4 w-4' /> Import Another
                    </Button>
                  </>
                )}
                {importStatus.status === "error" ||
                  (sessionExpired && (
                    <Button
                      onClick={resetForm}
                      variant='outline'
                      className='w-full transition duration-200'
                    >
                      Try Again
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`transition-opacity duration-300 ${
            !importStatus.status
              ? "opacity-100"
              : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          {!importStatus.status && (
            <form
              onSubmit={handleSubmit}
              className='space-y-4 animate-in fade-in duration-300'
            >
              <div className='space-y-2'>
                <label htmlFor='repoUrl' className='text-sm font-medium'>
                  GitHub Repository URL
                </label>
                <Input
                  id='repoUrl'
                  placeholder='https://github.com/username/repository'
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                  required
                  className='transition-all duration-200 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                />
                <p className='text-xs text-gray-500'>
                  Enter the full URL of the GitHub repository you want to import
                </p>
              </div>

              <Button
                type='submit'
                className='w-full flex items-center justify-center transition-all duration-200'
                disabled={loading || !repoUrl || sessionExpired}
              >
                {loading ? (
                  <>
                    <Spinner size='sm' className='mr-2' />
                    Importing...
                  </>
                ) : (
                  "Import Repository"
                )}
              </Button>
            </form>
          )}
        </div>
      </CardContent>

      <CardFooter className='text-xs text-gray-500 flex flex-col'>
        {sessionExpired && (
          <div className='p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md animate-in slide-in-from-bottom duration-300'>
            <h3 className='font-medium text-yellow-800'>
              GitHub Session Expired
            </h3>
            <p className='mt-1 text-sm text-yellow-700'>
              Unfortunately, GitHub OAuth sessions expire quite fast. I have
              session refresh on the development roadmap, but for now I&apos;m
              afraid I have to ask you to click on the button below to login
              with github again. Sorry about the inconvinience!
            </p>
            <Button
              onClick={handleReauthenticate}
              className='mt-3 block mx-auto bg-yellow-600 hover:bg-yellow-700'
            >
              Log in again
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
