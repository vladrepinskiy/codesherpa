"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function RepositoryImportForm() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    repositoryId: string | null;
    status: string | null;
    currentStage: string | null;
    errorMessage: string | null;
  }>({
    repositoryId: null,
    status: null,
    currentStage: null,
    errorMessage: null,
  });

  const router = useRouter();

  // Poll for status updates when repository is being processed
  useEffect(() => {
    if (
      !importStatus.repositoryId ||
      importStatus.status === "ready" ||
      importStatus.status === "error"
    ) {
      return; // Don't poll if process is complete or not started
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/repositories/status/${importStatus.repositoryId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get status");
        }

        setImportStatus((prev) => ({
          ...prev,
          status: data.status,
          currentStage: data.currentStage,
          errorMessage: data.errorMessage,
        }));

        // Stop polling if process is complete
        if (data.status === "ready" || data.status === "error") {
          clearInterval(intervalId);

          // Redirect to repository page if ready
          if (data.status === "ready") {
            setTimeout(() => {
              router.push(`/repositories/${importStatus.repositoryId}`);
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error polling for status:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId);
  }, [importStatus.repositoryId, importStatus.status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/repositories/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import repository");
      }

      setImportStatus({
        repositoryId: data.repositoryId,
        status: data.status,
        currentStage: "Starting import process...",
        errorMessage: null,
      });
    } catch (error) {
      console.error("Import error:", error);
      setError((error as string) || "An unexpected error occurred");
      setImportStatus({
        repositoryId: null,
        status: "error",
        currentStage: null,
        errorMessage: error as string,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (importStatus.status === "ready") {
      return "✅";
    } else if (importStatus.status === "error") {
      return "❌";
    } else {
      return "⏳";
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Import GitHub Repository</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {importStatus.repositoryId ? (
          <div className='space-y-4'>
            <div className='flex items-center space-x-2 p-4 bg-gray-50 rounded-lg'>
              <span className='text-xl'>{getStatusIcon()}</span>
              <div>
                <p className='font-medium'>
                  {importStatus.status === "ready"
                    ? "Import complete!"
                    : importStatus.status === "error"
                    ? "Import failed"
                    : "Importing repository..."}
                </p>
                <p className='text-sm text-gray-500'>
                  {importStatus.currentStage || "Processing..."}
                </p>
                {importStatus.errorMessage && (
                  <p className='text-sm text-red-500'>
                    {importStatus.errorMessage}
                  </p>
                )}
              </div>
            </div>

            {importStatus.status === "ready" && (
              <Button
                onClick={() =>
                  router.push(`/repositories/${importStatus.repositoryId}`)
                }
                className='w-full'
              >
                View Repository
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
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
              />
              <p className='text-xs text-gray-500'>
                Enter the full URL of the GitHub repository you want to import
              </p>
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loading || !repoUrl}
            >
              {loading ? "Importing..." : "Import Repository"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className='text-xs text-gray-500'>
        Repository will be analyzed and made searchable with AI
      </CardFooter>
    </Card>
  );
}
