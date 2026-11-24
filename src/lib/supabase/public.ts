import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-free public Supabase client for Server Components, generateMetadata,
 * generateStaticParams, and sitemap generation.
 *
 * Using `@/lib/supabase/server` calls `cookies()`, which forces Next.js App Router
 * to opt routes out of static generation / ISR (`private, no-cache, no-store`).
 * All public read-only queries MUST use this helper instead.
 */
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Normalized canonical origin (always https://www.pixenox.com, no trailing slash).
 */
export function getCanonicalSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.pixenox.com').trim();
  const normalized = raw.replace(/\/+$/, '');
  if (normalized === 'https://pixenox.com' || normalized === 'http://pixenox.com') {
    return 'https://www.pixenox.com';
  }
  return normalized;
}
