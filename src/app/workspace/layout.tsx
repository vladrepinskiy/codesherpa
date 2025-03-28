import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import Link from "next/link";
import { getUserProfile } from "@/lib/supabase/user-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, User, LogOut } from "lucide-react";
import Image from "next/image";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile to display name and avatar
  const profile = await getUserProfile();

  return (
    <div className='min-h-screen flex flex-col'>
      <header className='bg-white border-b py-4 px-6 sticky top-0 z-10'>
        <div className='container mx-auto flex justify-between items-center'>
          <Link href='/workspace/dashboard' className='font-bold text-xl'>
            CodeSherpa 🏔️
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='flex items-center gap-2'
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt='User avatar'
                    width={24}
                    height={24}
                    className='rounded-full'
                  />
                ) : (
                  <User size={16} />
                )}
                <span>{profile?.display_name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <div className='px-2 py-1.5 text-sm font-medium'>
                {profile?.display_name && (
                  <div className='font-semibold'>{profile.display_name}</div>
                )}
                <div className='text-xs text-muted-foreground'>
                  {user.email}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href='/workspace/settings'
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={logout} className='w-full'>
                  <Button
                    type='submit'
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start flex items-center gap-2 text-destructive'
                  >
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className='flex-1'>{children}</main>
    </div>
  );
}
