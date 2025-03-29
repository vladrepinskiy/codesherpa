import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingContent from "./onboarding-content";

export default async function OnboardingPage({
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

  // Get basic repository info
  const { data: repository } = await supabase
    .from("repositories")
    .select("name, full_name")
    .eq("id", repoId)
    .single();

  if (!repository) {
    redirect("/workspace/dashboard");
  }

  return <OnboardingContent params={{ id: repoId }} repository={repository} />;
}
