import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RepositoryContent from "./repository-content";

// We'll still need a server component to handle authentication
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

  // Update last accessed timestamp
  await supabase
    .from("repositories")
    .update({ last_accessed: new Date().toISOString() })
    .eq("id", repoId);

  // The component below will be a client component that uses SWR for data fetching
  return <RepositoryContent id={repoId} />;
}
