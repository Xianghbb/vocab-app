'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

/**
 * Custom hook for accessing Supabase browser client in React components
 * This hook provides a consistent way to access the singleton Supabase client
 * throughout the application while maintaining zero-backend architecture
 *
 * @returns Supabase client instance configured for browser usage
 */
export function useSupabase() {
  // Return the singleton supabase client instance
  return supabase
}

/**
 * Alternative hook that also provides loading state and error handling
 * Useful for components that need to handle initialization states
 */
export function useSupabaseWithStatus() {
  const [supabaseInstance, setSupabaseInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      // Use the existing singleton supabase client
      setSupabaseInstance(supabase)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'))
      setIsLoading(false)
    }
  }, [])

  return { supabase: supabaseInstance, isLoading, error }
}

export default useSupabase