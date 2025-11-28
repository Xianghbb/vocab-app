'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

/**
 * Test component to demonstrate Supabase client usage
 * This component shows how to use the useSupabase hook to interact with Supabase
 */
export default function SupabaseTest() {
  const supabase = useSupabase()
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test the connection to Supabase
    const testConnection = async () => {
      try {
        // Simple test query to check if we're connected
        // Use type assertion to bypass TypeScript strict checking for this test
        const { data, error } = await (supabase as any).from('dictionary')
          .select('id')
          .limit(1)

        if (error) {
          console.error('Supabase connection test failed:', error)
          setIsConnected(false)
        } else {
          console.log('Supabase connection successful')
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Supabase connection error:', error)
        setIsConnected(false)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [supabase])

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p className="text-yellow-800">Testing Supabase connection...</p>
      </div>
    )
  }

  return (
    <div className={`p-4 border rounded-lg ${
      isConnected
        ? 'bg-green-100 border-green-400'
        : 'bg-red-100 border-red-400'
    }`}>
      <h3 className="font-semibold mb-2">Supabase Connection Status</h3>
      <p className={isConnected ? 'text-green-800' : 'text-red-800'}>
        {isConnected ? '✅ Connected to Supabase' : '❌ Not connected to Supabase'}
      </p>
      {isConnected && (
        <p className="text-sm text-gray-600 mt-2">
          The Supabase client is properly configured and ready to use!
        </p>
      )}
    </div>
  )
}