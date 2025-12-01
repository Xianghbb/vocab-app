'use client'

import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Vocab App
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to track your vocabulary learning progress
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                footerActionLink: 'text-blue-600 hover:text-blue-700',
                formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                card: 'shadow-none',
              },
              layout: {
                socialButtonsPlacement: 'bottom',
                socialButtonsVariant: 'blockButton',
              }
            }}
            routing="hash"
            redirectUrl="/"
            afterSignInUrl="/"
          />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            New to Vocab App?{' '}
            <a
              href="/sign-up"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}