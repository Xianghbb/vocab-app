'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join Vocab App
          </h1>
          <p className="text-lg text-gray-600">
            Create your account to start learning vocabulary
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-sm normal-case',
                footerActionLink: 'text-green-600 hover:text-green-700',
                formFieldInput: 'border-gray-300 focus:border-green-500 focus:ring-green-500',
                card: 'shadow-none',
              },
              layout: {
                socialButtonsPlacement: 'bottom',
                socialButtonsVariant: 'blockButton',
              }
            }}
            routing="hash"
            redirectUrl="/"
            afterSignUpUrl="/"
          />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Already have an account?{' '}
            <a
              href="/login"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}