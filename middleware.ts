// ============================================================
// COMPUNIL — Middleware
// Admin routes are protected client-side via app/admin/layout.tsx
// and at the data layer via Firestore security rules.
// The cookie-based approach caused race conditions with async
// role fetching, so we rely on the more reliable client guard.
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Pass all requests through — admin protection handled client-side
  return NextResponse.next()
}

export const config = {
  // Only run on admin routes (does nothing, but keeps the matcher
  // in place so it's easy to re-enable server-side protection later)
  matcher: ['/admin/:path*'],
}
