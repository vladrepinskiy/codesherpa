import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingContent from "./onboarding-content";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const { id: repoId } = await params;

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
