// ============================================================
// COMPUNIL — Server-side Route Protection Middleware
// Runs on the Edge before every /admin request.
// The __compunil_admin cookie is set by useAuth after
// Firebase confirms the user's role from Firestore.
// Firestore security rules provide the real data-layer guard.
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = '__compunil_admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const cookie = request.cookies.get(ADMIN_COOKIE)
    const hasAccess = cookie?.value === 'granted'

    if (!hasAccess) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // Only run middleware on /admin routes
  matcher: ['/admin/:path*'],
}
