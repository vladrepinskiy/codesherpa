import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RepositoryImportForm from "./import-form";
import RepositoryGallery from "./repos-gallery";
import { RepositoryProvider } from "./repos-context";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className='container mx-auto py-10 px-4'>
      <RepositoryProvider>
        {/* Import Repository Form Card */}
        <div className='max-w-2xl mx-auto mb-16'>
          <RepositoryImportForm />
        </div>

        {/* Repository Gallery - Client Component */}
        <RepositoryGallery />
      </RepositoryProvider>
    </div>
  );
}
