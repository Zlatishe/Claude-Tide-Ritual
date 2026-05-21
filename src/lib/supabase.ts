import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy Supabase client.
 *
 * The previous implementation called `createClient` at module-evaluation time,
 * which crashed Vercel's prerender step whenever the env vars weren't present
 * (e.g. on builds before env vars are configured in project settings, or on
 * any route that doesn't actually need Supabase like /sandbox).
 *
 * Construction is now deferred until first use. If env vars are still missing
 * at call time, we throw a clear, actionable error instead of the generic
 * "supabaseUrl is required" from @supabase/supabase-js.
 */

let cached: SupabaseClient | null = null;

function build(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (locally in ' +
        '.env.local, on Vercel in Project Settings → Environment Variables).'
    );
  }

  return createClient(url, anonKey);
}

/**
 * Proxy that defers `createClient` until the first property access. This lets
 * `import { supabase } from '@/lib/supabase'` succeed at build time even when
 * env vars aren't available — only routes that actually invoke Supabase
 * methods at runtime will trigger client construction.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!cached) cached = build();
    return Reflect.get(cached, prop, receiver);
  },
});
