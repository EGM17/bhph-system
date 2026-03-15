import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PUBLIC_ADMIN_PATHS = ['/admin/login']
const PROTECTED_ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Never apply middleware to API routes ───────────────────────────────────
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ── Allow admin login page through without auth check ──────────────────────
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}?`)
  )
  if (isPublicAdminPath) {
    return NextResponse.next()
  }

  // ── Protect all other /admin/* routes ──────────────────────────────────────
  const isProtectedAdminPath = PROTECTED_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ── i18n routing for all public pages ─────────────────────────────────────
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Exclude static files, images, and API routes from middleware
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og-image.jpg|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}