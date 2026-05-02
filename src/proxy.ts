import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from './lib/auth-edge'

// Pages that REQUIRE login (private/personal)
const PRIVATE = [
  '/dashboard',
  '/profile',
  '/messages',
  '/sanctum',
  '/onboarding',
  '/admin',
]

// Pages that redirect logged-in users away (auth pages)
const AUTH_ROUTES = ['/signin', '/signup']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('aethr_session')?.value
  const user = token ? verifySessionToken(token) : null

  const isPrivate = PRIVATE.some(p => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p))

  // Not logged in trying to access private route → signin
  if (isPrivate && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Already logged in trying to access signin/signup → dashboard
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon.*).*)'],
}
