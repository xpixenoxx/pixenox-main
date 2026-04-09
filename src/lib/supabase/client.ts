import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Singleton browser client for use in providers & client components.
 * Prefer createClient() for fresh instances where needed.
 */
let _browserClient: ReturnType<typeof createClient> | null = null

export function getBrowserClient() {
  if (!_browserClient) {
    _browserClient = createClient()
  }
  return _browserClient
}
