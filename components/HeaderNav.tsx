/**
 * HeaderNav Component
 * Fixed top navigation bar with authentication controls and settings
 * Client component for handling user authentication state
 */

'use client'

import Link from 'next/link'
import { useUser, SignInButton, SignedIn, SignedOut, Protect } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function HeaderNav() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  if (!isLoaded) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
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
          <span className="text-2xl">📚</span>
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
            <span className="text-xl">⚙️</span>
          </Link>

          {/* Pricing/Subscription Link */}
          <SignedIn>
            {/* Show Upgrade button for users without vocab:pro permission */}
            <Protect
              permission="vocab:pro"
              fallback={
                <Link
                  href="/pricing"
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-sm shadow-sm"
                  title="Upgrade to Pro"
                >
                  Upgrade
                </Link>
              }
            >
              {/* Show Manage link for users with vocab:pro permission */}
              <Link
                href="/pricing"
                className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100 font-medium text-sm"
                title="Manage Subscription"
              >
                Manage
              </Link>
            </Protect>
          </SignedIn>

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