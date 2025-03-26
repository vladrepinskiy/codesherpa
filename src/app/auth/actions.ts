"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Define return types for your actions
type AuthActionResult =
  | { error: string; success?: never }
  | { success: string; error?: never }
  | undefined; // For when we redirect and don't return anything

export async function login(formData: FormData): Promise<AuthActionResult> {
  // TODO: Validate formData with zod
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // If successful, redirect (this won't return)
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const supabase = await createClient();

    // Check if the site URL is properly set
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      "http://localhost:3000";

    console.log("Using site URL for redirect:", siteUrl);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("Supabase signup error:", error);
      return { error: `Signup failed: ${error.message}` };
    }

    // Check if email confirmation is required
    if (data?.user?.identities?.length === 0) {
      return { error: "This email is already registered" };
    }

    // Check if email confirmation is needed
    if (data?.user && !data.user.confirmed_at) {
      return {
        success: "Check your email to confirm your account",
        requiresEmailConfirmation: true,
      };
    }

    return { success: "Account created successfully" };
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return {
      error: `An unexpected error occurred during signup: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
