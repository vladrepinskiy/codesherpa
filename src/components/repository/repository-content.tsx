"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRepository } from "@/hooks/use-repository";
import { RepositoryHeader } from "@/components/repository/repository-header";
import { RepositoryInfoCard } from "@/components/repository/repository-info-card";
import SyncStatusCard from "@/components/repository/sync-status-card";
import { RepositoryStatisticsCard } from "@/components/repository/repository-statistics-card";
import { RepositoryNavigationCards } from "@/components/repository/repository-navigation-cards";

export default function RepositoryContent({ id }: { id: string }) {
  const router = useRouter();
  const { repository, isLoading, isError } = useRepository(id);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isError) {
      router.push("/workspace/dashboard");
    }
  }, [isError, router]);

  // Fade in effect to smoothen the introduction of the repository content
  useEffect(() => {
    if (repository && !isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [repository, isLoading]);

  if (!repository) {
    return null;
  }

  return (
    <div
      className={`container mx-auto py-10 px-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <RepositoryHeader repository={repository} />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
        <RepositoryInfoCard repository={repository} />
        <SyncStatusCard />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <RepositoryStatisticsCard
          filesCount={repository.filesCount}
          discussionsCount={repository.discussionsCount}
          uniqueAuthorsCount={repository.uniqueAuthorsCount}
        />
        <RepositoryNavigationCards repositoryId={repository.id} />
      </div>
    </div>
  );
}
