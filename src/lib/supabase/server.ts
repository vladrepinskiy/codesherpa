import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // Custom fetch with timeout
  const fetchWithTimeout = (
    url: RequestInfo | URL,
    options: RequestInit = {}
  ) => {
    const controller = new AbortController();
    const { signal } = controller;

    // Set a 10-second timeout
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
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // This error can be safely ignored in some contexts
            // The middleware will handle cookie setting properly
            console.log(error);
            console.log(`Note: Cookie '${name}' will be set by middleware`);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            console.log(error);
            console.log(
              `Note: Cookie '${name}' removal will be handled by middleware`
            );
          }
        },
      },
      global: {
        fetch: fetchWithTimeout,
      },
    }
  );
}
