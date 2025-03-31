"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
