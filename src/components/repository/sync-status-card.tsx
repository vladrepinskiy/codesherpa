"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Loader2,
  AlertTriangle,
  Database,
  Server,
  FileText,
  MessageCircle,
} from "lucide-react";
import useSWR from "swr";
import { useParams } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface IntegrityData {
  repositoryId: string;
  code: {
    supabaseCount: number;
    chromaCount: number;
    collectionExists: boolean;
    isIntact: boolean;
  };
  discussions: {
    supabaseCount: number;
    chromaCount: number;
    collectionExists: boolean;
    isIntact: boolean;
  };
  overallIntegrity: boolean;
  timestamp: string;
}

export default function SyncStatusCard() {
  const params = useParams();
  const repositoryId = params.id as string;

  const { data, error, isLoading } = useSWR<IntegrityData>(
    `/api/repositories/${repositoryId}/integrity`,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center text-lg'>
          {isLoading ? (
            <Loader2 className='h-5 w-5 mr-2 text-blue-500 animate-spin' />
          ) : error ? (
            <AlertTriangle className='h-5 w-5 mr-2 text-red-500' />
          ) : data?.overallIntegrity ? (
            <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
          ) : (
            <AlertTriangle className='h-5 w-5 mr-2 text-yellow-500' />
          )}
          Data Synchronization
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className='h-full flex flex-col justify-center'>
          {isLoading ? (
            <p className='text-sm text-gray-500'>
              Verifying data integrity between ChromaDB and Supabase...
            </p>
          ) : error ? (
            <p className='text-sm text-red-500'>
              Failed to verify data integrity. Please try again later.
            </p>
          ) : data?.overallIntegrity ? (
            <div className='flex items-center'>
              <CheckCircle className='h-5 w-5 mr-3 text-green-500' />
              <div>
                <p className='text-lg font-medium'>Data is synchronized</p>
                <p className='text-sm text-gray-500'>
                  All data is properly synchronized between ChromaDB and
                  Supabase.
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  Last checked:{" "}
                  {data.timestamp
                    ? new Date(data.timestamp).toLocaleTimeString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          ) : data ? (
            <div className='space-y-4'>
              <div className='flex items-center'>
                <AlertTriangle className='h-5 w-5 mr-3 text-yellow-500' />
                <p className='text-sm font-medium text-amber-600'>
                  Synchronization issues detected
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Code Files Sync Status */}
                <div className='space-y-2'>
                  <h3 className='text-sm font-medium flex items-center'>
                    <FileText className='h-4 w-4 mr-1 text-blue-500' />
                    Code Files Sync
                  </h3>

                  {!data.code.collectionExists ? (
                    <p className='text-xs text-red-500'>
                      ChromaDB collection missing
                    </p>
                  ) : data.code.isIntact ? (
                    <p className='text-xs text-green-500'>In sync ✓</p>
                  ) : (
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='flex items-center'>
                        <Database className='h-3 w-3 mr-1 text-purple-500' />
                        <span className='text-xs'>
                          Supabase: {data.code.supabaseCount} files
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <Server className='h-3 w-3 mr-1 text-blue-500' />
                        <span className='text-xs'>
                          ChromaDB: {data.code.chromaCount} files
                        </span>
                      </div>
                      <div className='col-span-2 text-xs text-yellow-600'>
                        {data.code.supabaseCount > data.code.chromaCount
                          ? `${
                              data.code.supabaseCount - data.code.chromaCount
                            } files missing from ChromaDB`
                          : `${
                              data.code.chromaCount - data.code.supabaseCount
                            } extra files in ChromaDB`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Discussions Sync Status */}
                <div className='space-y-2'>
                  <h3 className='text-sm font-medium flex items-center'>
                    <MessageCircle className='h-4 w-4 mr-1 text-purple-500' />
                    Discussions Sync
                  </h3>

                  {!data.discussions.collectionExists ? (
                    <p className='text-xs text-red-500'>
                      ChromaDB collection missing
                    </p>
                  ) : data.discussions.isIntact ? (
                    <p className='text-xs text-green-500'>In sync ✓</p>
                  ) : (
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='flex items-center'>
                        <Database className='h-3 w-3 mr-1 text-purple-500' />
                        <span className='text-xs'>
                          Supabase: {data.discussions.supabaseCount} items
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <Server className='h-3 w-3 mr-1 text-blue-500' />
                        <span className='text-xs'>
                          ChromaDB: {data.discussions.chromaCount} items
                        </span>
                      </div>
                      <div className='col-span-2 text-xs text-yellow-600'>
                        {data.discussions.supabaseCount >
                        data.discussions.chromaCount
                          ? `${
                              data.discussions.supabaseCount -
                              data.discussions.chromaCount
                            } items missing from ChromaDB`
                          : `${
                              data.discussions.chromaCount -
                              data.discussions.supabaseCount
                            } extra items in ChromaDB`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='text-xs text-gray-500 mt-2'>
                Last checked:{" "}
                {data.timestamp
                  ? new Date(data.timestamp).toLocaleTimeString()
                  : "Unknown"}
              </div>
            </div>
          ) : (
            // Fallback case when data is undefined but not loading or error
            <p className='text-sm text-gray-500'>
              No synchronization data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
