import Link from "next/link";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/auth/actions";
import { Profile } from "@/types/user";

interface HeaderProps {
  userEmail: string;
  profile: Profile | null;
}

export function Header({ userEmail, profile }: HeaderProps) {
  return (
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
              <span>{profile?.display_name || userEmail}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <div className='px-2 py-1.5 text-sm font-medium'>
              {profile?.display_name && (
                <div className='font-semibold'>{profile.display_name}</div>
              )}
              <div className='text-xs text-muted-foreground'>{userEmail}</div>
            </div>
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
  );
}
