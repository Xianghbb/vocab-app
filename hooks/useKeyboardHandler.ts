/**
 * Keyboard event handler hook for flashcard navigation
 * Manages event listeners for Space, ArrowLeft, and ArrowRight keys
 * This is a client-side only hook for Zero-Backend architecture
 */

import { useEffect, useCallback } from 'react'

/**
 * Configuration for keyboard event handling
 */
export interface KeyboardHandlerConfig {
  onSpace?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  enabled?: boolean
  preventDefault?: boolean
}

/**
 * Custom hook for managing keyboard event listeners
 * Handles Space, ArrowLeft, and ArrowRight key presses for flashcard navigation
 *
 * @param config - Configuration object with callback functions and options
 * @returns Object with methods to manually trigger actions and check enabled state
 */
export function useKeyboardHandler(config: KeyboardHandlerConfig = {}) {
  const {
    onSpace,
    onArrowLeft,
    onArrowRight,
    enabled = true,
    preventDefault = true
  } = config

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const { key, code } = event

    // Check for specific keys
    switch (key) {
      case ' ':
      case 'Spacebar':
        if (onSpace) {
          if (preventDefault) {
            event.preventDefault()
          }
          onSpace()
        }
        break

      case 'ArrowLeft':
      case 'Left':
        if (onArrowLeft) {
          if (preventDefault) {
            event.preventDefault()
          }
          onArrowLeft()
        }
        break

      case 'ArrowRight':
      case 'Right':
        if (onArrowRight) {
          if (preventDefault) {
            event.preventDefault()
          }
          onArrowRight()
        }
        break

      default:
        break
    }
  }, [onSpace, onArrowLeft, onArrowRight, enabled, preventDefault])

  /**
   * Manually trigger space action
   */
  const triggerSpace = useCallback(() => {
    if (onSpace && enabled) {
      onSpace()
    }
  }, [onSpace, enabled])

  /**
   * Manually trigger arrow left action
   */
  const triggerArrowLeft = useCallback(() => {
    if (onArrowLeft && enabled) {
      onArrowLeft()
    }
  }, [onArrowLeft, enabled])

  /**
   * Manually trigger arrow right action
   */
  const triggerArrowRight = useCallback(() => {
    if (onArrowRight && enabled) {
      onArrowRight()
    }
  }, [onArrowRight, enabled])

  /**
   * Setup and cleanup keyboard event listeners
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleKeyPress = (event: KeyboardEvent) => {
      handleKeyDown(event)
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyPress)

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyDown])

  return {
    enabled,
    triggerSpace,
    triggerArrowLeft,
    triggerArrowRight
  }
}

/**
 * Alternative hook with predefined flashcard navigation actions
 * Specifically designed for vocabulary flashcard applications
 */
export function useFlashcardNavigation({
  onFlip,
  onPrevious,
  onNext,
  enabled = true,
  preventDefault = true
}: {
  onFlip?: () => void
  onPrevious?: () => void
  onNext?: () => void
  enabled?: boolean
  preventDefault?: boolean
}) {
  return useKeyboardHandler({
    onSpace: onFlip,
    onArrowLeft: onPrevious,
    onArrowRight: onNext,
    enabled,
    preventDefault
  })
}

/**
 * Hook for managing keyboard shortcuts in a more generic way
 * Allows for custom key mappings
 */
export function useCustomKeyboardHandler(
  keyMap: Record<string, () => void>,
  options: {
    enabled?: boolean
    preventDefault?: boolean
  } = {}
) {
  const { enabled = true, preventDefault = true } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const action = keyMap[event.key] || keyMap[event.code]

    if (action) {
      if (preventDefault) {
        event.preventDefault()
      }
      action()
    }
  }, [keyMap, enabled, preventDefault])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    enabled,
    triggerAction: (key: string) => {
      const action = keyMap[key]
      if (action && enabled) {
        action()
      }
    }
  }
}

export default useKeyboardHandler