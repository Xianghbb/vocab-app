'use client'

import { useState, useEffect } from 'react'
import { fetchRandomWord, fetchRandomWords, type Word, type WordFetchResult } from '@/lib/data/word-fetch'

/**
 * Test component to demonstrate word fetching functionality
 * Shows how to use the fetchRandomWord function to get vocabulary words
 */
export default function WordFetcher() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wordHistory, setWordHistory] = useState<Word[]>([])

  const loadRandomWord = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchRandomWord()

      if (result.success && result.data) {
        setCurrentWord(result.data)
        setWordHistory(prev => [...prev, result.data!].slice(-5)) // Keep last 5 words
      } else {
        setError(result.error?.message || 'Failed to fetch word')
      }
    } catch (err) {
      setError('Unexpected error occurred')
      console.error('Error loading random word:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMultipleWords = async () => {
    setLoading(true)
    setError(null)

    try {
      const results = await fetchRandomWords(3)
      const successfulWords = results
        .filter(result => result.success && result.data)
        .map(result => result.data!)

      if (successfulWords.length > 0) {
        setCurrentWord(successfulWords[0])
        setWordHistory(successfulWords)
      } else {
        setError('Failed to fetch words')
      }
    } catch (err) {
      setError('Unexpected error occurred')
      console.error('Error loading multiple words:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load initial word on component mount
    loadRandomWord()
  }, [])

  if (loading && !currentWord) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading vocabulary...</span>
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
            onClick={loadRandomWord}
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
      {/* Current Word Display */}
      {currentWord && (
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">Current Word</h3>
            <span className="text-sm text-gray-500">ID: {currentWord.id.slice(0, 8)}...</span>
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
          onClick={loadRandomWord}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'New Random Word'}
        </button>

        <button
          onClick={loadMultipleWords}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load 3 Words
        </button>
      </div>

      {/* Word History */}
      {wordHistory.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Recent Words</h4>
          <div className="space-y-2">
            {wordHistory.map((word, index) => (
              <div key={`${word.id}-${index}`} className="flex justify-between text-sm">
                <span className="font-medium">{word.english_word}</span>
                <span className="text-gray-600">{word.chinese_translation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}