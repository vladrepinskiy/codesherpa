import { createClient } from "@/lib/supabase/server";
import RepositoryContent from "@/components/repository/repository-content";

export default async function RepositoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { id: repoId } = await params;

  // Update last accessed timestamp
  await supabase
    .from("repositories")
    .update({ last_accessed: new Date().toISOString() })
    .eq("id", repoId);

  // The component below will be a client component that uses SWR for data fetching
  return <RepositoryContent id={repoId} />;
}
