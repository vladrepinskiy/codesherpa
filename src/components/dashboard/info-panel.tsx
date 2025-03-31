import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, GitFork, Search, Sparkles } from "lucide-react";

export default function InfoPanel() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-xl'>
          What happens when you import a repository?
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-6'>
          <div className='flex gap-3'>
            <div className='mt-0.5'>
              <GitFork className='h-5 w-5 text-blue-500' />
            </div>
            <div>
              <h3 className='font-medium text-base'>Code Cloning</h3>
              <p className='text-muted-foreground'>
                We use your github personal access token to clone your
                repository. We also pull a lot of textual information from the
                repository - pull requests, issues and discussions.
              </p>
            </div>
          </div>

          <div className='flex gap-3'>
            <div className='mt-0.5'>
              <Code className='h-5 w-5 text-indigo-500' />
            </div>
            <div>
              <h3 className='font-medium text-base'>File Analysis</h3>
              <p className='text-muted-foreground'>
                We run through the repository files, filtering out irrelevant
                ones, analyzing and recording metadata about useful source code
                files
              </p>
            </div>
          </div>

          <div className='flex gap-3'>
            <div className='mt-0.5'>
              <Search className='h-5 w-5 text-amber-500' />
            </div>
            <div>
              <h3 className='font-medium text-base'>
                Vector Embedding Creation
              </h3>
              <p className='text-muted-foreground'>
                We create semantic embeddings in ChromaDB, enabling powerful
                search capabilities across your code and discussions.
              </p>
            </div>
          </div>

          <div className='flex gap-3'>
            <div className='mt-0.5'>
              <Sparkles className='h-5 w-5 text-purple-500' />
            </div>
            <div>
              <h3 className='font-medium text-base'>AI-Powered Context</h3>
              <p className='text-muted-foreground'>
                All this information is fed to our LLMs using semantic search,
                providing accurate and relevant responses during chat sessions.
              </p>
            </div>
          </div>
        </div>

        <div className='mt-4 p-3 bg-muted rounded-md text-sm'>
          <p>
            These processes run in the background and may take a few minutes
            depending on repository size. You&apos;ll be notified when your
            repository is ready for AI interaction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
