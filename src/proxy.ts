import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from './lib/auth-edge'

const PROTECTED = ['/dashboard', '/profile', '/commons', '/forge', '/arena', '/the-deep', '/the-void', '/messages', '/galaxy-tv', '/market', '/sanctum', '/archive']
const AUTH_ROUTES = ['/signin', '/signup']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('aethr_session')?.value
  const user = token ? verifySessionToken(token) : null

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
