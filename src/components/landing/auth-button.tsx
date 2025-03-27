"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        setIsLoggedIn(!!data.user);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleClick = () => {
    router.push(isLoggedIn ? "/dashboard" : "/auth/login");
  };

  if (isLoggedIn === null) {
    // Loading state
    return (
      <Button disabled variant='outline' className='w-32'>
        Loading...
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} variant='default' size='lg'>
      {isLoggedIn ? "Go to Dashboard" : "Sign In"}
    </Button>
  );
}
