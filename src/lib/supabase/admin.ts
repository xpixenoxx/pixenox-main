import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * Admin client using service role key.
 * NEVER expose this on the client — server-only.
 * Used for privileged operations like user management.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const supabaseAdmin = url && key
  ? createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null as any
