/**
 * Statistics query utilities for user dashboard
 * Implements client-side statistics calculation for zero-backend architecture
 */

'use client'

import { supabase } from '@/lib/supabase/client'
import type { UserStatistics } from '@/types'

/**
 * Fetch comprehensive user statistics for dashboard
 * Calculates: total reviewed, today's reviews, this week's reviews, remaining words
 */
export async function fetchUserStats(userId: string): Promise<UserStatistics | null> {
  try {
    // Get total reviewed words (any word with progress record)
    const { data: totalData, error: totalError } = await (supabase as any)
      .from('user_progress')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (totalError) throw totalError

    // Get today's reviews
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const { data: todayData, error: todayError } = await (supabase as any)
      .from('user_progress')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('last_reviewed_at', `${today}T00:00:00`)
      .lt('last_reviewed_at', `${today}T23:59:59`)

    if (todayError) throw todayError

    // Get this week's reviews (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data: weekData, error: weekError } = await (supabase as any)
      .from('user_progress')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('last_reviewed_at', weekAgo.toISOString())

    if (weekError) throw weekError

    // Get remaining words (new or unknown status, or no progress)
    const { data: remainingData, error: remainingError } = await (supabase as any)
      .rpc('get_remaining_words_count', { p_user_id: userId })

    if (remainingError) throw remainingError

    return {
      total: totalData?.count || 0,
      today: todayData?.count || 0,
      thisWeek: weekData?.count || 0,
      remaining: remainingData || 0
    }
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    return null
  }
}

/**
 * Fetch user statistics with fallback to basic queries if RPC is not available
 */
export async function fetchUserStatsBasic(userId: string): Promise<UserStatistics | null> {
  try {
    // Get total reviewed words
    const { count: totalCount } = await (supabase as any)
      .from('user_progress')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get today's reviews
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const { count: todayCount } = await (supabase as any)
      .from('user_progress')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('last_reviewed_at', todayStart.toISOString())
      .lt('last_reviewed_at', todayEnd.toISOString())

    // Get this week's reviews
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: weekCount } = await (supabase as any)
      .from('user_progress')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('last_reviewed_at', weekAgo.toISOString())

    // Get remaining words (words not marked as known)
    const { count: remainingCount } = await (supabase as any)
      .from('dictionary')
      .select('*', { count: 'exact', head: true })

    const { count: knownCount } = await (supabase as any)
      .from('user_progress')
      .select('word_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'known')

    const totalWords = remainingCount || 0
    const knownWords = knownCount || 0
    const remaining = totalWords - knownWords

    return {
      total: totalCount || 0,
      today: todayCount || 0,
      thisWeek: weekCount || 0,
      remaining: Math.max(0, remaining)
    }
  } catch (error) {
    console.error('Error fetching basic user statistics:', error)
    return null
  }
}

/**
 * Fetch detailed progress breakdown by status
 */
export async function fetchProgressBreakdown(userId: string): Promise<{
  new: number
  known: number
  unknown: number
} | null> {
  try {
    // Get count by status
    const { data, error } = await (supabase as any)
      .from('user_progress')
      .select('status')
      .eq('user_id', userId)

    if (error) throw error

    const breakdown = { new: 0, known: 0, unknown: 0 }

    data.forEach((record: any) => {
      if (record.status in breakdown) {
        breakdown[record.status as keyof typeof breakdown]++
      }
    })

    return breakdown
  } catch (error) {
    console.error('Error fetching progress breakdown:', error)
    return null
  }
}

/**
 * Fetch learning streak data
 */
export async function fetchLearningStreak(userId: string): Promise<{
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
} | null> {
  try {
    // Get last 30 days of study activity
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await (supabase as any)
      .from('user_progress')
      .select('last_reviewed_at')
      .eq('user_id', userId)
      .gte('last_reviewed_at', thirtyDaysAgo.toISOString())
      .order('last_reviewed_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null
      }
    }

    // Extract unique dates
    const studyDates = new Set(
      data.map((record: any) =>
        new Date(record.last_reviewed_at).toISOString().split('T')[0]
      )
    )

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calculate streaks
    const sortedDates = Array.from(studyDates).sort().reverse()

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i] as string)
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        tempStreak++
        if (i === 0) currentStreak = tempStreak
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
        break
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      currentStreak,
      longestStreak,
      lastStudyDate: sortedDates[0] as string
    }
  } catch (error) {
    console.error('Error fetching learning streak:', error)
    return null
  }
}