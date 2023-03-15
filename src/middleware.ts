// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

import { isMainAppDomain, MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

function handleCrossSiteAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const requestHost = request.headers.get('host')
  const isAppDomain = isMainAppDomain(requestHost)
  const searchParams = new URLSearchParams(request.nextUrl.searchParams)

  const secureCookie = process.env.NODE_ENV === 'production'
  const nextAuthSessionCookie = secureCookie
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'

  if (isAppDomain) {
    if (pathname === '/signin') {
      if (searchParams && searchParams.get('next')) {
        const response = NextResponse.next()
        response.cookies.set('next', searchParams.get('next'))
        return response
      }
    }

    // OAuth happens on main app domain
    // So when auth completes, it will be redirected to /signin-complete
    // Here we check the "next" param and redirect accordingly.
    if (pathname === '/signin-complete') {
      const _next =
        searchParams.get('next') || request.cookies.get('next') || '/'
      request.cookies.delete('next')

      if (_next && !_next.startsWith('/')) {
        const nextUrl = new URL(_next, request.nextUrl)
        const crossSigninUrl = new URL(
          `/signin-complete?next=${encodeURIComponent(
            nextUrl.pathname
          )}&session-token=${request.cookies.get(nextAuthSessionCookie)}`,
          nextUrl
        )
        const response = NextResponse.redirect(crossSigninUrl)
        response.cookies.delete('next')
        return response
      } else {
        return NextResponse.redirect(new URL(_next, request.nextUrl))
      }
    }
  } else {
    // Sign-in page should always visible on the main app domain only
    if (pathname === '/signin') {
      const response = NextResponse.redirect(
        new URL(
          `${
            request.nextUrl.protocol
          }//${MAIN_APP_DOMAIN}/signin?next=${encodeURIComponent(
            `https://${requestHost}`
          )}`,
          request.nextUrl
        )
      )
      return response
    }

    if (pathname === '/signin-complete') {
      const next = searchParams.get('next') || '/'
      const sessionToken = searchParams.get('session-token')
      const response = NextResponse.redirect(new URL(next, request.nextUrl))
      response.cookies.set(nextAuthSessionCookie, sessionToken, {
        secure: secureCookie,
        domain: requestHost.split(':')[0],
        httpOnly: true,
      })
      return response
    }

    // All authentication will occur on the main app domain
    if (pathname.startsWith('/api/auth')) {
      searchParams.set('origin_host', requestHost)

      const response = NextResponse.rewrite(
        new URL(
          `${
            request.nextUrl.protocol
          }//${MAIN_APP_DOMAIN}${pathname}?${searchParams.toString()}`,
          request.nextUrl
        )
      )

      if (pathname.includes('/signin')) {
        response.cookies.set('next-auth.callback-url-host', requestHost)
      }

      return response
    }
  }

  return NextResponse.next()
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signin-complete') ||
    pathname.startsWith('/api/auth')
  ) {
    return handleCrossSiteAuth(request)
  }

  const requestHost = request.headers.get('host')
  const isAppDomain = isMainAppDomain(requestHost)

  if (isAppDomain) {
    // App Domain: Mapping of /account to /admin
    if (pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/account`, request.nextUrl))
    }
  } else {
    // Some paths are only accessible on the main app domain
    if (pathname.startsWith('/hq') || pathname.startsWith('/account')) {
      return NextResponse.redirect(
        new URL(
          `${request.nextUrl.protocol}//${MAIN_APP_DOMAIN}${pathname}`,
          request.nextUrl
        )
      )
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/hq/:path*',
    '/account/:path*',
    '/admin/:path*',
    '/api/auth/:path*',
    '/signin',
    '/signin-complete',
  ],
}
