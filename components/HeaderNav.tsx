/**
 * HeaderNav Component
 * Fixed top navigation bar with authentication controls and settings
 * Client component for handling user authentication state
 */

'use client'

import Link from 'next/link'
import { useUser, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import { Settings, BookOpen } from 'lucide-react'

export default function HeaderNav() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">VocabApp</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">VocabApp</span>
        </Link>

        {/* Navigation and Controls */}
        <div className="flex items-center space-x-4">
          {/* Settings/Dashboard Link */}
          <Link
            href="/dashboard"
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
            title="Dashboard"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* Authentication Controls */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Login
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}