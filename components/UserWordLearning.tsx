'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { fetchPrioritizedWord, type Word, type WordFetchResult } from '@/lib/data/word-fetch'
import { updateWordStatus, markWordAsKnown, markWordAsUnknown, getWordProgress, type ProgressUpdateResult } from '@/lib/data/progress-update'

/**
 * User word learning component
 * Demonstrates prioritized word fetching and progress updates for authenticated users
 */
export default function UserWordLearning() {
  const { user, isLoaded } = useUser()
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [currentProgress, setCurrentProgress] = useState<string>('new')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPrioritizedWord = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchPrioritizedWord(user.id)

      if (result.success && result.data) {
        setCurrentWord(result.data)

        // Check current progress for this word
        const progressResult = await getWordProgress(user.id, result.data.id)
        if (progressResult.success && progressResult.data) {
          setCurrentProgress(progressResult.data.status)
        } else {
          setCurrentProgress('new')
        }
      } else {
        setError(result.error?.message || 'Failed to fetch prioritized word')
      }
    } catch (err) {
      setError('Unexpected error occurred')
      console.error('Error loading prioritized word:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: 'known' | 'unknown') => {
    if (!user?.id || !currentWord) return

    setUpdating(true)
    setError(null)

    try {
      const result = await updateWordStatus(user.id, currentWord.id, status)

      if (result.success && result.data) {
        setCurrentProgress(result.data.status)
        // Automatically load next word after a short delay
        setTimeout(() => {
          loadPrioritizedWord()
        }, 1000)
      } else {
        setError(result.error?.message || 'Failed to update word status')
      }
    } catch (err) {
      setError('Unexpected error occurred')
      console.error('Error updating word status:', err)
    } finally {
      setUpdating(false)
    }
  }

  const markAsKnown = async () => {
    if (!user?.id || !currentWord) return

    setUpdating(true)
    setError(null)

    try {
      const result = await markWordAsKnown(user.id, currentWord.id)

      if (result.success && result.data) {
        setCurrentProgress('known')
        setTimeout(() => {
          loadPrioritizedWord()
        }, 1000)
      } else {
        setError(result.error?.message || 'Failed to mark word as known')
      }
    } catch (err) {
      setError('Unexpected error occurred')
      console.error('Error marking word as known:', err)
    } finally {
      setUpdating(false)
    }
  }

  const markAsUnknown = async () => {
    if (!user?.id || !currentWord) return

    setUpdating(true)
    setError(null)

    try {
      const result = await markWordAsUnknown(user.id, currentWord.id)

      if (result.success && result.data) {
        setCurrentProgress('unknown')
        setTimeout(() => {
          loadPrioritizedWord()
        }, 1000)
      } else {
        setError(result.error?.message || 'Failed to mark word as unknown')
      }
    } catch (err) {
      setError('Unexpected error occurred')
      console.error('Error marking word as unknown:', err)
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (isLoaded && user?.id) {
      loadPrioritizedWord()
    }
  }, [isLoaded, user?.id])

  if (!isLoaded) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading user data...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-yellow-800">
          <p className="font-semibold">Authentication Required</p>
          <p className="text-sm">Please sign in to access personalized vocabulary learning.</p>
        </div>
      </div>
    )
  }

  if (loading && !currentWord) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading your personalized vocabulary...</span>
        </div>
      </div>
    )
  }

  if (error && !currentWord) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800">
          <p className="font-semibold">Error loading words</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadPrioritizedWord}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Personalized Learning</h3>
        <p className="text-gray-600">Words prioritized for your learning journey</p>
      </div>

      {/* Current Word Display */}
      {currentWord && (
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xl font-bold text-gray-800">Current Word</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                currentProgress === 'known' ? 'bg-green-100 text-green-800' :
                currentProgress === 'unknown' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentProgress}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">English:</span>
              <p className="text-2xl font-bold text-blue-600">{currentWord.english_word}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600">Chinese:</span>
              <p className="text-xl text-green-600">{currentWord.chinese_translation}</p>
            </div>

            {currentWord.example_sentence && (
              <div>
                <span className="text-sm font-medium text-gray-600">Example:</span>
                <p className="text-gray-700 italic">"{currentWord.example_sentence}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={markAsKnown}
          disabled={updating || currentProgress === 'known'}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updating ? 'Updating...' : 'I Know This'}
        </button>

        <button
          onClick={markAsUnknown}
          disabled={updating || currentProgress === 'unknown'}
          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updating ? 'Updating...' : 'Need Practice'}
        </button>

        <button
          onClick={loadPrioritizedWord}
          disabled={updating}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h5 className="font-semibold text-blue-800 mb-2">How it works:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Words you marked as "unknown" or "new" are shown first</li>
          <li>• Then words you haven't reviewed yet</li>
          <li>• Finally, completely new words from the dictionary</li>
          <li>• Your progress is automatically saved</li>
        </ul>
      </div>

      {/* User Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Learning as: {user.emailAddresses[0]?.emailAddress || user.id}</p>
      </div>
    </div>
  )
}