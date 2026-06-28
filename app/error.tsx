'use client'
// ============================================================
// COMPUNIL — Global Error Boundary
// ============================================================

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Compunil] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
        ⚠️
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-8 max-w-sm text-sm">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-teal transition-colors"
        >
          Try Again
        </button>
        <Link href="/"
          className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  )
}
