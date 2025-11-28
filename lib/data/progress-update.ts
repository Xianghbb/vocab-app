/**
 * User progress update utilities for vocabulary learning
 * Provides client-side functions to update user progress and word status
 */

import { supabase } from '@/lib/supabase/client'

/**
 * User progress data structure
 */
export interface UserProgress {
  user_id: string
  word_id: string
  status: 'new' | 'known' | 'unknown'
  last_reviewed_at: string
  created_at?: string
  updated_at?: string
}

/**
 * Result type for progress update operations
 */
export interface ProgressUpdateResult {
  data: UserProgress | null
  error: Error | null
  success: boolean
}

/**
 * Updates the status of a word for a specific user
 * Performs an upsert operation on the user_progress table
 *
 * @param userId - The ID of the user
 * @param wordId - The ID of the word to update
 * @param status - The new status ('known' | 'unknown')
 * @returns Promise<ProgressUpdateResult> - The updated progress or error information
 */
export async function updateWordStatus(
  userId: string,
  wordId: string,
  status: 'known' | 'unknown'
): Promise<ProgressUpdateResult> {
  try {
    // Validate inputs
    if (!userId || !wordId) {
      return {
        data: null,
        error: new Error('User ID and Word ID are required'),
        success: false
      }
    }

    if (!['known', 'unknown'].includes(status)) {
      return {
        data: null,
        error: new Error('Status must be either "known" or "unknown"'),
        success: false
      }
    }

    // Perform upsert operation
    const { data, error } = await (supabase as any)
      .from('user_progress')
      .upsert({
        user_id: userId,
        word_id: wordId,
        status: status,
        last_reviewed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,word_id' // Specify the conflict resolution columns
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating word status:', error)
      return {
        data: null,
        error: new Error('Failed to update word status'),
        success: false
      }
    }

    if (!data) {
      return {
        data: null,
        error: new Error('No data returned from update operation'),
        success: false
      }
    }

    return {
      data: data as UserProgress,
      error: null,
      success: true
    }

  } catch (error) {
    console.error('Unexpected error in updateWordStatus:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }
  }
}

/**
 * Marks a word as known for a specific user
 *
 * @param userId - The ID of the user
 * @param wordId - The ID of the word to mark as known
 * @returns Promise<ProgressUpdateResult> - The updated progress or error information
 */
export async function markWordAsKnown(
  userId: string,
  wordId: string
): Promise<ProgressUpdateResult> {
  return updateWordStatus(userId, wordId, 'known')
}

/**
 * Marks a word as unknown for a specific user
 *
 * @param userId - The ID of the user
 * @param wordId - The ID of the word to mark as unknown
 * @returns Promise<ProgressUpdateResult> - The updated progress or error information
 */
export async function markWordAsUnknown(
  userId: string,
  wordId: string
): Promise<ProgressUpdateResult> {
  return updateWordStatus(userId, wordId, 'unknown')
}

/**
 * Gets the current progress for a specific word and user
 *
 * @param userId - The ID of the user
 * @param wordId - The ID of the word
 * @returns Promise<ProgressUpdateResult> - The current progress or error information
 */
export async function getWordProgress(
  userId: string,
  wordId: string
): Promise<ProgressUpdateResult> {
  try {
    if (!userId || !wordId) {
      return {
        data: null,
        error: new Error('User ID and Word ID are required'),
        success: false
      }
    }

    const { data, error } = await (supabase as any)
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single()

    if (error) {
      // If no record found, that's okay - word is effectively 'new'
      if (error.code === 'PGRST116') { // No rows found
        return {
          data: null,
          error: null,
          success: true // Word is new/not in progress
        }
      }

      console.error('Error fetching word progress:', error)
      return {
        data: null,
        error: new Error('Failed to fetch word progress'),
        success: false
      }
    }

    return {
      data: data as UserProgress,
      error: null,
      success: true
    }

  } catch (error) {
    console.error('Unexpected error in getWordProgress:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }
  }
}

/**
 * Gets all progress for a specific user
 *
 * @param userId - The ID of the user
 * @returns Promise<{ data: UserProgress[] | null, error: Error | null, success: boolean }>
 */
export async function getAllUserProgress(
  userId: string
): Promise<{ data: UserProgress[] | null; error: Error | null; success: boolean }> {
  try {
    if (!userId) {
      return {
        data: null,
        error: new Error('User ID is required'),
        success: false
      }
    }

    const { data, error } = await (supabase as any)
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_reviewed_at', { ascending: false })

    if (error) {
      console.error('Error fetching user progress:', error)
      return {
        data: null,
        error: new Error('Failed to fetch user progress'),
        success: false
      }
    }

    return {
      data: data as UserProgress[],
      error: null,
      success: true
    }

  } catch (error) {
    console.error('Unexpected error in getAllUserProgress:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }
  }
}

/**
 * Gets progress statistics for a specific user
 *
 * @param userId - The ID of the user
 * @returns Promise<{ data: { total: number, known: number, unknown: number, new: number } | null, error: Error | null, success: boolean }>
 */
export async function getUserProgressStats(
  userId: string
): Promise<{
  data: { total: number; known: number; unknown: number; new: number } | null
  error: Error | null
  success: boolean
}> {
  try {
    if (!userId) {
      return {
        data: null,
        error: new Error('User ID is required'),
        success: false
      }
    }

    // Get total progress count
    const { count: total, error: totalError } = await (supabase as any)
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (totalError) {
      console.error('Error fetching total progress:', totalError)
      return {
        data: null,
        error: new Error('Failed to fetch progress statistics'),
        success: false
      }
    }

    // Get counts by status
    const { data: statusCounts, error: statusError } = await (supabase as any)
      .from('user_progress')
      .select('status', { count: 'exact' })
      .eq('user_id', userId)

    if (statusError) {
      console.error('Error fetching status counts:', statusError)
      return {
        data: null,
        error: new Error('Failed to fetch progress statistics'),
        success: false
      }
    }

    // Calculate statistics
    const stats = { total: total || 0, known: 0, unknown: 0, new: 0 }

    if (statusCounts) {
      statusCounts.forEach((item: any) => {
        if (item.status === 'known') stats.known++
        else if (item.status === 'unknown') stats.unknown++
        else if (item.status === 'new') stats.new++
      })
    }

    return {
      data: stats,
      error: null,
      success: true
    }

  } catch (error) {
    console.error('Unexpected error in getUserProgressStats:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }
  }
}

export default {
  updateWordStatus,
  markWordAsKnown,
  markWordAsUnknown,
  getWordProgress,
  getAllUserProgress,
  getUserProgressStats
}