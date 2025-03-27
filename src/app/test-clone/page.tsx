/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function TestClonePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check user on component mount
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    getUser();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "repo read:user user:email", // Request repo access
        },
      });
    } catch (error) {
      console.error("GitHub login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleClone = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/repositories/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      // Handle error with proper type checking
      if (error instanceof Error) {
        setResult({ error: error.message });
      } else {
        setResult({ error: "An unknown error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Test Repository Cloning</h1>

      {!user ? (
        <button
          onClick={handleSignIn}
          className='bg-black text-white p-2 rounded'
        >
          Sign in with GitHub
        </button>
      ) : (
        <>
          <div className='mb-4'>
            Signed in as {user.email}
            <button
              onClick={handleSignOut}
              className='ml-4 bg-gray-200 p-2 rounded'
            >
              Sign out
            </button>
          </div>

          <div className='mb-4'>
            <input
              type='text'
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder='GitHub repository URL'
              className='border p-2 w-full'
            />
          </div>

          <button
            onClick={handleClone}
            disabled={loading || !repoUrl}
            className='bg-blue-500 text-white p-2 rounded disabled:bg-gray-300'
          >
            {loading ? "Cloning..." : "Clone Repository"}
          </button>

          {result && (
            <pre className='mt-4 p-4 bg-gray-100 rounded overflow-auto'>
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
