/**
 * Dashboard Page
 * User statistics and learning progress overview
 */

import dynamic from 'next/dynamic'
import Link from 'next/link'

const StatsDashboard = dynamic(() => import('@/components/StatsDashboard'), {
  loading: () => <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg">Loading dashboard...</div>
})

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">VocabApp Dashboard 1</h1>
              <p className="text-gray-600">Track your learning progress and achievements</p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ← Back to Learning
              </Link>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-600">Space: Flip Card</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-600">→: Mark Known</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-gray-600">←: Need Practice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <StatsDashboard />
      </div>
    </div>
  )
}