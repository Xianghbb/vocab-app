/**
 * Statistics Dashboard Component
 * Displays user learning statistics with clean, professional design
 * Mobile-first responsive layout
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { fetchUserStats, fetchProgressBreakdown, fetchLearningStreak } from '@/lib/data/stats-query'
import type { UserStatistics, ProgressBreakdown, LearningStreak } from '@/types'

/**
 * Stat card component for individual statistics
 */
function StatCard({
  title,
  value,
  icon,
  color = 'blue',
  subtitle
}: {
  title: string
  value: number | string
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    red: 'bg-red-50 border-red-200 text-red-800'
  }

  const iconBgClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75 mb-1">{title}</p>
          <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="text-sm opacity-60 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Progress breakdown component showing status distribution
 */
function ProgressBreakdown({ breakdown }: { breakdown: ProgressBreakdown }) {
  const total = breakdown.new + breakdown.known + breakdown.unknown

  if (total === 0) return null

  const percentages = {
    new: Math.round((breakdown.new / total) * 100),
    known: Math.round((breakdown.known / total) * 100),
    unknown: Math.round((breakdown.unknown / total) * 100)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Breakdown</h3>

      <div className="space-y-4">
        {/* New Words */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">New Words</span>
            <span className="text-sm font-semibold text-gray-800">{breakdown.new}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentages.new}%` }}
            />
          </div>
        </div>

        {/* Known Words */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Known Words</span>
            <span className="text-sm font-semibold text-gray-800">{breakdown.known}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentages.known}%` }}
            />
          </div>
        </div>

        {/* Unknown Words */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Need Practice</span>
            <span className="text-sm font-semibold text-gray-800">{breakdown.unknown}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentages.unknown}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Reviewed:</span>
          <span className="font-semibold">{total} words</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Learning streak component
 */
function LearningStreak({ streak }: { streak: LearningStreak }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-xl border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-800">Learning Streak</h3>
        <div className="w-12 h-12 rounded-lg bg-purple-200 flex items-center justify-center">
          <span className="text-2xl">🔥</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-purple-700 font-medium">Current Streak</span>
          <span className="text-2xl font-bold text-purple-800">{streak.currentStreak}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-purple-700 font-medium">Longest Streak</span>
          <span className="text-xl font-semibold text-purple-800">{streak.longestStreak}</span>
        </div>

        {streak.lastStudyDate && (
          <div className="pt-3 border-t border-purple-200">
            <p className="text-sm text-purple-600">
              Last studied: {new Date(streak.lastStudyDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Main Stats Dashboard Component
 */
export default function StatsDashboard() {
  const { user, isLoaded } = useUser()
  const [stats, setStats] = useState<UserStatistics | null>(null)
  const [breakdown, setBreakdown] = useState<ProgressBreakdown | null>(null)
  const [streak, setStreak] = useState<LearningStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Validate user ID
      if (!user?.id) {
        throw new Error('No user ID available')
      }

      console.log('Loading dashboard stats for user:', user.id)

      // Fetch all statistics in parallel
      const [statsData, breakdownData, streakData] = await Promise.all([
        fetchUserStats(user.id),
        fetchProgressBreakdown(user.id),
        fetchLearningStreak(user.id)
      ])

      console.log('Dashboard stats loaded:', { statsData, breakdownData, streakData })

      // Handle null returns gracefully
      setStats(statsData || { total: 0, today: 0, thisWeek: 0, remaining: 0 })
      setBreakdown(breakdownData || { new: 0, known: 0, unknown: 0 })
      setStreak(streakData || { currentStreak: 0, longestStreak: 0, lastStudyDate: null })
    } catch (err) {
      setError('Failed to load statistics')
      console.error('Error loading dashboard stats:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err instanceof Error ? err.stack : String(err),
        userId: user?.id
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && user?.id) {
      loadStats()
    }
  }, [isLoaded, user?.id])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Sign in to view statistics</h2>
        <p className="text-yellow-700">Track your learning progress and see detailed analytics</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl border border-gray-200 bg-gray-50 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error loading statistics</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">Track your vocabulary learning progress</p>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reviewed"
          value={stats?.total || 0}
          icon="📚"
          color="blue"
          subtitle="Unique words you've studied"
        />

        <StatCard
          title="Today's Progress"
          value={stats?.today || 0}
          icon="📅"
          color="green"
          subtitle="Words reviewed today"
        />

        <StatCard
          title="This Week"
          value={stats?.thisWeek || 0}
          icon="📈"
          color="purple"
          subtitle="Words reviewed this week"
        />

        <StatCard
          title="Remaining"
          value={stats?.remaining || 0}
          icon="🎯"
          color="orange"
          subtitle="Words still to learn"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {breakdown && (
          <ProgressBreakdown breakdown={breakdown} />
        )}

        {streak && (
          <LearningStreak streak={streak} />
        )}
      </div>

      {/* Action Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue Learning
          </a>

          <button
            onClick={loadStats}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  )
}

// Add some custom styles for the dashboard
export const DashboardStyles = () => (
  <style jsx global>{`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.5s ease-out;
    }

    .stat-card-hover:hover {
      transform: translateY(-2px);
    }
  `}</style>
)