import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/user-service";
import { Header } from "@/components/layout/header";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getUserProfile();

  return (
    <div className='min-h-screen flex flex-col'>
      <Header userEmail={user!.email || ""} profile={profile} />
      <main className='flex-1'>{children}</main>
    </div>
  );
}
