import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

/**
 * Creates a Supabase browser client instance for client-side usage
 * This client is used for all browser-based Supabase operations
 */
export const createSupabaseBrowserClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Supabase browser client singleton
 * Use this for consistent client instance across the application
 */
export const supabase = createSupabaseBrowserClient()

export default supabase