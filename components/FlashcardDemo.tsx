'use client'

import { useState } from 'react'
import FlashcardComponent from './FlashcardComponent'
import { type Word } from '@/lib/data/word-fetch'

/**
 * Demo component for showcasing the flashcard functionality
 * Provides controls and examples of the flashcard component in action
 */

// Sample words for demonstration
const sampleWords: Word[] = [
  {
    id: '1',
    english_word: 'hello',
    chinese_translation: '你好',
    example_sentence: 'Hello, how are you today?'
  },
  {
    id: '2',
    english_word: 'world',
    chinese_translation: '世界',
    example_sentence: 'The world is full of opportunities.'
  },
  {
    id: '3',
    english_word: 'learn',
    chinese_translation: '学习',
    example_sentence: 'I want to learn new vocabulary every day.'
  },
  {
    id: '4',
    english_word: 'vocabulary',
    chinese_translation: '词汇',
    example_sentence: 'Building vocabulary is essential for language learning.'
  },
  {
    id: '5',
    english_word: 'practice',
    chinese_translation: '练习',
    example_sentence: 'Daily practice helps improve language skills.'
  }
]

export default function FlashcardDemo() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [autoMode, setAutoMode] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [wordHistory, setWordHistory] = useState<string[]>([])

  const handleWordChange = (word: Word | null) => {
    if (word) {
      setWordHistory(prev => [...prev, word.id].slice(-10))
    }
  }

  const handleStatusUpdate = (wordId: string, status: 'known' | 'unknown') => {
    console.log(`Word ${wordId} marked as ${status}`)
    // Here you could integrate with the progress update functions
  }

  const currentWord = sampleWords[currentWordIndex]

  const goToNextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % sampleWords.length)
  }

  const goToPreviousWord = () => {
    setCurrentWordIndex((prev) => (prev - 1 + sampleWords.length) % sampleWords.length)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-2">Vocabulary Flashcards</h3>
        <p className="text-gray-600">Interactive vocabulary learning with keyboard navigation</p>
      </div>

      {/* Main Flashcard */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
        <FlashcardComponent
          initialWord={currentWord}
          onWordChange={handleWordChange}
          onStatusUpdate={handleStatusUpdate}
          autoAdvance={autoMode}
          showControls={showControls}
        />
      </div>

      {/* Demo Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Demo Controls</h4>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Navigation Controls */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-700">Navigation</h5>

            <div className="flex gap-2">
              <button
                onClick={goToPreviousWord}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={goToNextWord}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Next →
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoMode"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoMode" className="text-sm text-gray-700">
                Auto-advance after marking
              </label>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-700">Display Options</h5>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showControls"
                checked={showControls}
                onChange={(e) => setShowControls(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showControls" className="text-sm text-gray-700">
                Show control buttons
              </label>
            </div>

            <div className="text-sm text-gray-600">
              <p>Current word: {currentWordIndex + 1} of {sampleWords.length}</p>
              <p>Word ID: {currentWord.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-blue-800 mb-2">🔄 Flip Animation</h5>
          <p className="text-blue-700 text-sm">Click the card or press Space to flip between English and Chinese</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h5 className="font-semibold text-green-800 mb-2">⌨️ Keyboard Navigation</h5>
          <p className="text-green-700 text-sm">Use arrow keys and spacebar for hands-free navigation</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h5 className="font-semibold text-purple-800 mb-2">📱 Mobile First</h5>
          <p className="text-purple-700 text-sm">Responsive design that works perfectly on all devices</p>
        </div>
      </div>

      {/* Keyboard Shortcuts Guide */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-3">Keyboard Shortcuts</h5>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Space</span>
            <span className="text-gray-600">Flip card</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">→</span>
            <span className="text-gray-600">Next word</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">←</span>
            <span className="text-gray-600">Previous word</span>
          </div>
        </div>
      </div>

      {/* Word History */}
      {wordHistory.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h5 className="font-semibold text-gray-800 mb-2">Recent Words</h5>
          <div className="flex flex-wrap gap-2">
            {wordHistory.map((wordId, index) => (
              <span
                key={`${wordId}-${index}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                Word {wordId.slice(0, 4)}...
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Add some custom styles for the demo
const FlashcardDemoStyles = () => (
  <style jsx global>{`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `}</style>
)

export { FlashcardDemoStyles }