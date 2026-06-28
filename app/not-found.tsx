// ============================================================
// COMPUNIL — 404 Not Found Page
// ============================================================

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-black text-brand-navy opacity-10 select-none mb-4">404</div>
      <h1 className="text-2xl font-bold text-brand-navy mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/"
          className="px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-teal transition-colors">
          Go Home
        </Link>
        <Link href="/shop"
          className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
          Browse Products
        </Link>
      </div>
    </div>
  )
}
