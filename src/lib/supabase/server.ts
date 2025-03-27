import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // Custom fetch with a 10-second timeout
  const fetchWithTimeout = (
    url: RequestInfo | URL,
    options: RequestInit = {}
  ) => {
    const controller = new AbortController();
    const { signal } = controller;

    const timeout = setTimeout(() => {
      controller.abort();
      console.error("Supabase request timed out");
    }, 10000);

    return fetch(url, {
      ...options,
      signal,
    }).finally(() => {
      clearTimeout(timeout);
    });
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookies) {
          try {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.error(error, `Some cookies will be set by middleware`);
          }
        },
      },
      global: {
        fetch: fetchWithTimeout,
      },
    }
  );
}
