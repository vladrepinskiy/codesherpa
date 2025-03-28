import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className='container mx-auto py-10'>
      <header className='flex justify-between items-center mb-10'>
        <div>
          <h1 className='text-3xl font-bold'>CodeSherpa Dashboard</h1>
          <p className='text-gray-600'>Welcome, {user.email}</p>
        </div>
        <form action={logout}>
          <Button type='submit' variant='outline'>
            Sign Out
          </Button>
        </form>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Import Repository</CardTitle>
            <CardDescription>
              Import a GitHub repository to analyze its structure and code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <p>Enter a GitHub repository URL to start exploring:</p>
              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='https://github.com/username/repo'
                  className='flex-1 px-3 py-2 border rounded-md'
                />
                <Button>Import</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Repositories</CardTitle>
            <CardDescription>
              Your recently analyzed repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <p className='text-gray-500 italic'>
                No repositories analyzed yet.
              </p>
              <p className='text-sm'>
                Import your first repository to get started with CodeSherpa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
