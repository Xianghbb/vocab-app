'use client'

import { useState, useEffect } from 'react'
import { useKeyboardHandler } from '@/hooks/useKeyboardHandler'
import { fetchRandomWord, fetchPrioritizedWord, type Word, type WordFetchResult } from '@/lib/data/word-fetch'
import { useUser } from '@clerk/nextjs'

/**
 * Flashcard component for vocabulary learning
 * Based on Figma design analysis: Professional card layout with flip animation
 * Main card area: 928x337px with centered content and action buttons
 * Features extracted from Figma metadata:
 * - Centered word display (node 0:46)
 * - Instruction text (node 0:49)
 * - Action buttons: "Don't Know" (node 0:54) and "Know" (node 0:57)
 * - Responsive mobile-first design
 */

interface FlashcardComponentProps {
  initialWord?: Word
  onWordChange?: (word: Word | null) => void
  onStatusUpdate?: (wordId: string, status: 'known' | 'unknown') => void
  autoAdvance?: boolean
  showControls?: boolean
}

export default function FlashcardComponent({
  initialWord,
  onWordChange,
  onStatusUpdate,
  autoAdvance = true,
  showControls = true
}: FlashcardComponentProps) {
  const { user, isLoaded } = useUser()
  const [currentWord, setCurrentWord] = useState<Word | null>(initialWord || null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animationClass, setAnimationClass] = useState('')

  /**
   * Load a new word based on user authentication status
   */
  const loadWord = async () => {
    setIsLoading(true)
    setError(null)
    setIsFlipped(false)
    setAnimationClass('animate-pulse')

    try {
      let result: WordFetchResult

      if (user?.id) {
        // For authenticated users, fetch prioritized words
        result = await fetchPrioritizedWord(user.id)
      } else {
        // For guests, fetch random words
        result = await fetchRandomWord()
      }

      if (result.success && result.data) {
        setCurrentWord(result.data)
        setAnimationClass('animate-fade-in')
        onWordChange?.(result.data)
      } else {
        setError(result.error?.message || 'Failed to load word')
        setCurrentWord(null)
        onWordChange?.(null)
      }
    } catch (err) {
      setError('Unexpected error occurred')
      setCurrentWord(null)
      onWordChange?.(null)
      console.error('Error loading word:', err)
    } finally {
      setIsLoading(false)
      setTimeout(() => setAnimationClass(''), 500)
    }
  }

  /**
   * Handle card flip
   */
  const handleFlip = () => {
    if (isLoading || !currentWord) return
    setIsFlipped(!isFlipped)
  }

  /**
   * Handle next word
   */
  const handleNext = () => {
    loadWord()
  }

  /**
   * Handle word status update
   */
  const handleStatusUpdate = async (status: 'known' | 'unknown') => {
    if (!currentWord || !user?.id) return

    setUpdating(true)

    try {
      onStatusUpdate?.(currentWord.id, status)

      if (autoAdvance) {
        setTimeout(() => {
          loadWord()
        }, 800)
      }
    } catch (err) {
      console.error('Error updating word status:', err)
    } finally {
      setUpdating(false)
    }
  }

  /**
   * Setup keyboard navigation
   */
  const { triggerSpace, triggerArrowLeft, triggerArrowRight } = useKeyboardHandler({
    onSpace: handleFlip,
    onArrowRight: handleNext,
    onArrowLeft: () => {
      console.log('Previous word (not implemented)')
    },
    enabled: !isLoading && !!currentWord
  })

  /**
   * Load initial word on mount
   */
  useEffect(() => {
    if (!initialWord && isLoaded) {
      loadWord()
    }
  }, [isLoaded])

  /**
   * Reset flip state when word changes
   */
  useEffect(() => {
    setIsFlipped(false)
  }, [currentWord])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 font-medium mb-2">Error loading word</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadWord}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Flashcard Area - Based on Figma dimensions 928x337px */}
      <div className="relative mb-8">
        {/* Flashcard Container - Responsive version of Figma layout */}
        <div
          className={`relative w-full h-80 md:h-96 transition-all duration-500 transform-gpu cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          } ${animationClass}`}
          onClick={handleFlip}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front of card (English) - Based on Figma text positioning */}
          <div
            className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Word Display - Centered like Figma node 0:46 */}
            <div className="text-center flex-1 flex items-center justify-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800"
                style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
              >
                {currentWord?.english_word || 'Loading...'}
              </h2>
            </div>

            {/* Instruction Text - Based on Figma node 0:49 */}
            <div className="absolute bottom-16 left-0 right-0 px-8"
            >
              <div className="text-center"
              >
                <p className="text-gray-500 text-lg"
                  style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}
                >
                  Click card or press space to reveal the Chinese translation
                </p>
              </div>
            </div>

            {/* Example Sentence - If available */}
            {currentWord?.example_sentence && (
              <div className="absolute bottom-4 left-4 right-4"
              >
                <p className="text-sm text-gray-600 italic text-center"
                  style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
                >
                  "{currentWord.example_sentence}"
                </p>
              </div>
            )}
          </div>

          {/* Back of card (Chinese) - Complementary design */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 flex flex-col items-center justify-center p-8 backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Chinese Translation - Centered */}
            <div className="text-center flex-1 flex items-center justify-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-blue-800"
                style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
              >
                {currentWord?.chinese_translation}
              </h2>
            </div>

            {/* Back instruction */}
            <div className="absolute bottom-16 left-0 right-0 px-8"
            >
              <div className="text-center"
              >
                <p className="text-blue-600 text-lg"
                  style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}
                >
                  Click or press space to flip back
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Action Buttons Section - Based on Figma node 0:50 (513px from top) */}
      {showControls && (
        <div className="bg-white rounded-lg p-4 mb-4"
          style={{ minHeight: '64px' }} /* Matching Figma button section height */
        >
          <div className="flex justify-center gap-4"
          >
            {/* Navigation Controls */}
            <div className="flex gap-3"
            >
              <button
                onClick={handleFlip}
                disabled={isLoading || !currentWord}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
              >
                Flip Card
              </button>

              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
              >
                Next Word →
              </button>
            </div>
          </div>

          {/* Status Controls (for authenticated users) - Based on Figma button layout */}
          {user?.id && currentWord && (
            <div className="flex justify-center gap-4 mt-4"
            >
              {/* "Don't Know" Button - Based on Figma node 0:54 */}
              <button
                onClick={() => handleStatusUpdate('unknown')}
                disabled={isLoading || updating}
                className="px-6 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
                style={{ minWidth: '120px' }} /* Approximate Figma button width */
              >
                {updating ? 'Updating...' : "Don't Know"}
              </button>

              {/* "Know" Button - Based on Figma node 0:57 */}
              <button
                onClick={() => handleStatusUpdate('known')}
                disabled={isLoading || updating}
                className="px-6 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
                style={{ minWidth: '80px' }} /* Approximate Figma button width */
              >
                {updating ? 'Updating...' : 'Know'}
              </button>
            </div>
          )}

          {/* Keyboard Shortcuts Info - Mobile-friendly */}
          <div className="text-center text-sm text-gray-500 mt-4"
            style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
          >
            <p className="mb-1">Keyboard shortcuts:</p>
            <div className="flex justify-center gap-3 flex-wrap"
            >
              <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</span> Flip</span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-gray-200 rounded text-xs">→</span> Next</span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-gray-200 rounded text-xs">←</span> Previous</span>
            </div>
          </div>
        </div>
      )}

      {/* Guest Info */}
      {!user && (
        <div className="text-center text-sm text-gray-500"
          style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
        >
          <p>Sign in to track your progress and get personalized word recommendations!</p>
        </div>
      )}
    </div>
  )
}

// Add custom CSS for flip animation and responsive design
const FlashcardStyles = () => (
  <style jsx global>{`
    .rotate-y-180 {
      transform: rotateY(180deg);
    }

    .backface-hidden {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      -moz-backface-visibility: hidden;
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Ensure proper 3D transforms */
    .preserve-3d {
      transform-style: preserve-3d;
    }
  `}</style>
)

export { FlashcardStyles }