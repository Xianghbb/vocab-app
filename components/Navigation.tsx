/**
 * Navigation Component
 * Simple navigation between main app sections
 */

'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function Navigation() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return null

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-gray-800">VocabApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Learn
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}

            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              {user ? 'Profile' : 'Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}