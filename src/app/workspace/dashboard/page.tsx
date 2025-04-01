import { RepositoryProvider } from "@/contexts/repos-context";
import RepositoryImportForm from "@/components/dashboard/import-form";
import RepositoryGallery from "@/components/dashboard/repos-gallery";
import InfoPanel from "@/components/dashboard/info-panel";

export default async function Dashboard() {
  return (
    <div className='container mx-auto py-10 px-4'>
      <RepositoryProvider>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
          <div className='flex items-center justify-center h-full'>
            <div className='w-full max-w-md'>
              <RepositoryImportForm />
            </div>
          </div>
          <InfoPanel />
        </div>
        <RepositoryGallery />
      </RepositoryProvider>
    </div>
  );
}
