'use client'

import dynamic from 'next/dynamic'

const FlashcardComponent = dynamic(() => import('@/components/FlashcardComponent'), {
  loading: () => <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <FlashcardComponent />
      </div>
    </div>
  )
}