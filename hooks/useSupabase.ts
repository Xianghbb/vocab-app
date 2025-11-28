'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

/**
 * Custom hook for accessing Supabase browser client in React components
 * This hook ensures the client is only created on the client-side
 * and provides a consistent way to access Supabase throughout the application
 *
 * @returns Supabase client instance configured for browser usage
 */
export function useSupabase() {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  return supabase
}

/**
 * Alternative hook that also provides loading state and error handling
 * Useful for components that need to handle initialization states
 */
export function useSupabaseWithStatus() {
  const [supabase, setSupabase] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      const client = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      setSupabase(client)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'))
      setIsLoading(false)
    }
  }, [])

  return { supabase, isLoading, error }
}

export default useSupabase