import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatContent from "./chat-content";

export default async function RepositoryChatPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { id: repoId } = await params;

  // Get basic repository info
  const { data: repository } = await supabase
    .from("repositories")
    .select("name, full_name")
    .eq("id", repoId)
    .single();

  if (!repository) {
    redirect("/workspace/dashboard");
  }

  return <ChatContent params={{ id: repoId }} repository={repository} />;
}
