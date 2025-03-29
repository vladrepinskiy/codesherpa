import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ExternalLink,
  Star,
  FileText,
  GitBranch,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SyncStatusCard from "./sync-status-card";
import RepositoryChat from "./repository-chat";

// Fetch the repository data from Supabase
async function getRepositoryData(id: string) {
  const supabase = await createClient();

  const { data: repository, error } = await supabase
    .from("repositories")
    .select("*, user_repositories!inner(is_favorite)")
    .eq("id", id)
    .single();

  if (error || !repository) {
    console.error("Error fetching repository:", error);
    return null;
  }

  // Get repository files count
  const { count: filesCount } = await supabase
    .from("repository_files")
    .select("id", { count: "exact", head: true })
    .eq("repository_id", id);

  // Get repository discussions count
  const { count: discussionsCount } = await supabase
    .from("repository_discussions")
    .select("id", { count: "exact", head: true })
    .eq("repository_id", id);

  // Get unique authors count
  const { data: discussionsData } = await supabase
    .from("repository_discussions")
    .select("author")
    .eq("repository_id", id);

  const uniqueAuthors = new Set(
    discussionsData?.map((discussion) => discussion.author)
  );

  return {
    ...repository,
    isFavorite: repository.user_repositories[0]?.is_favorite || false,
    filesCount: filesCount || 0,
    discussionsCount: discussionsCount || 0,
    uniqueAuthorsCount: uniqueAuthors?.size || 0,
  };
}

export default async function RepositoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { id: repoId } = await params;

  // Get repository data
  const repository = await getRepositoryData(repoId);

  if (!repository) {
    redirect("/workspace/dashboard");
  }

  // Update last accessed timestamp
  await supabase
    .from("repositories")
    .update({ last_accessed: new Date().toISOString() })
    .eq("id", repoId);

  return (
    <div className='container mx-auto py-10 px-4'>
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

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <FileText className='h-5 w-5 mr-2 text-blue-500' />
                <div>
                  <p className='text-2xl font-bold'>{repository.filesCount}</p>
                  <p className='text-sm text-gray-500'>Files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <MessageCircle className='h-5 w-5 mr-2 text-purple-500' />
                <div>
                  <p className='text-2xl font-bold'>
                    {repository.discussionsCount}
                  </p>
                  <p className='text-sm text-gray-500'>
                    Discussions
                    <span className='ml-2 text-xs text-gray-400'>
                      ({repository.uniqueAuthorsCount} authors)
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link
            href={`/workspace/repository/${repository.id}/onboarding`}
            className='block'
          >
            <Card className='h-full transition-all hover:shadow-md'>
              <CardContent className='pt-6 h-full'>
                <div className='flex items-center h-full'>
                  <BookOpen className='h-5 w-5 mr-2 text-amber-500' />
                  <div>
                    <p className='text-lg font-medium'>Onboarding Plan</p>
                    <p className='text-sm text-gray-500'>AI-generated guide</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <SyncStatusCard />
        </div>

        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Repository Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Owner</h3>
                  <p>{repository.owner}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Default Branch
                  </h3>
                  <div className='flex items-center'>
                    <GitBranch className='h-4 w-4 mr-1 text-green-500' />
                    <p>{repository.default_branch}</p>
                  </div>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Stars</h3>
                  <div className='flex items-center'>
                    <Star className='h-4 w-4 mr-1 text-yellow-500' />
                    <p>{repository.stars_count}</p>
                  </div>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Last Analyzed
                  </h3>
                  <p>
                    {repository.last_analyzed
                      ? formatDistanceToNow(
                          new Date(repository.last_analyzed),
                          {
                            addSuffix: true,
                          }
                        )
                      : "Not analyzed yet"}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Status</h3>
                  <p
                    className={
                      repository.status === "ready"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }
                  >
                    {repository.status === "ready"
                      ? "Ready"
                      : repository.status}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Privacy</h3>
                  <p>{repository.is_private ? "Private" : "Public"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repository Chat Interface */}
        <RepositoryChat
          repositoryId={repository.id}
          repositoryName={repository.name}
        />
      </div>
    </div>
  );
}
