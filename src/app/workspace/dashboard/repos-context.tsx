"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type RepositoryContextType = {
  refreshTrigger: number;
  triggerRefresh: () => void;
};

const RepositoryContext = createContext<RepositoryContextType | undefined>(
  undefined
);

// Simple context component to facilitate the communication between the import-form and repos-gallery components
export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <RepositoryContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositoryContext() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error(
      "useRepositoryContext must be used within a RepositoryProvider"
    );
  }
  return context;
}
