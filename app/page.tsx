import dynamic from 'next/dynamic'
import Link from 'next/link'

const SupabaseTest = dynamic(() => import('@/components/SupabaseTest'), {
  ssr: false,
  loading: () => <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">Loading Supabase test...</div>
})

const WordFetcher = dynamic(() => import('@/components/WordFetcher'), {
  ssr: false,
  loading: () => <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg">Loading word fetcher...</div>
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Welcome to Vocab App
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          Learn new vocabulary words and improve your language skills
        </p>

        {/* Authentication Links */}
        <div className="flex justify-center gap-4 mb-12">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Sign Up
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Learn Words</h3>
            <p className="text-gray-600">Discover new vocabulary with interactive flashcards</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-green-600">Track Progress</h3>
            <p className="text-gray-600">Monitor your learning journey and achievements</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-purple-600">Practice Daily</h3>
            <p className="text-gray-600">Build consistent learning habits with daily practice</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="max-w-2xl mx-auto">
            <SupabaseTest />
          </div>

          <div className="max-w-2xl mx-auto">
            <WordFetcher />
          </div>
        </div>
      </div>
    </div>
  );
}