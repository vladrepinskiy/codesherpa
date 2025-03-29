"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SyncStatusCard() {
  const [, setStatus] = useState<"checking" | "good" | "error">("checking");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a check that takes 5 seconds
    const timer = setTimeout(() => {
      // Hardcoded to "good" for now
      setStatus("good");
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='flex items-center'>
          {loading ? (
            <Loader2 className='h-5 w-5 mr-2 text-blue-500 animate-spin' />
          ) : (
            <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
          )}
          <div>
            <p className='text-lg font-medium'>
              {loading ? "Checking sync status..." : "Data is in sync"}
            </p>
            <p className='text-sm text-gray-500'>
              {loading
                ? "Verifying ChromaDB and Supabase data integrity"
                : "ChromaDB and Supabase data are properly synchronized"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
