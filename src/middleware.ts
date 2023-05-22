// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

import { isMainAppDomain, MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

/**
 * Handle pathname='/login'
 * @param req
 * @returns
 */
function handleCrossSiteLogin(req: NextRequest) {
  const hostname = req.headers.get('host')
  const isAppDomain = isMainAppDomain(hostname)
  const url = req.nextUrl
  const searchParams = url.searchParams

  if (isAppDomain) {
    // Already logged in
    if (
      req.cookies.get('next-auth.session-token') ||
      req.cookies.get('__Secure-next-auth.session-token')
    ) {
      let nextUrl = new URL(url)
      if (searchParams && searchParams.get('next')) {
        nextUrl = new URL(searchParams.get('next') as string, url)
      } else {
        nextUrl.pathname = '/'
      }

      return NextResponse.redirect(nextUrl)
    }

    // Set the "next" into cookies to redirect after login
    if (searchParams && searchParams.get('next')) {
      const response = NextResponse.next()
      response.cookies.set('next', searchParams.get('next'))
      return response
    }
  } else {
    // Sign-in page should always visible on the main app domain only
    const response = NextResponse.redirect(
      new URL(
        `${url.protocol}//${MAIN_APP_DOMAIN}/login?next=${encodeURIComponent(
          `${url.protocol}//${hostname}`
        )}`,
        url
      )
    )
    return response
  }
  return NextResponse.next()
}

/**
 * Handle pathname='/signin-complete'
 * @param req
 * @returns
 */
function handleCrossSiteSigninComplete(req: NextRequest) {
  const hostname = req.headers.get('host')
  const isAppDomain = isMainAppDomain(hostname)
  const searchParams = req.nextUrl.searchParams

  const secureCookie = process.env.NODE_ENV === 'production'
  const nextAuthSessionCookie = secureCookie
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token'

  if (isAppDomain) {
    // OAuth happens on main app domain
    // So when auth completes, it will be redirected to /signin-complete
    // Here we check the "next" param and redirect accordingly.
    const _next = searchParams.get('next') || req.cookies.get('next') || '/'
    req.cookies.delete('next')

    if (_next && !_next.startsWith('/')) {
      const nextUrl = new URL(_next)
      const crossSigninUrl = new URL(
        `/signin-complete?next=${encodeURIComponent(
          nextUrl.toString()
        )}&session-token=${req.cookies.get(nextAuthSessionCookie)}`,
        nextUrl
      )

      const response = NextResponse.redirect(crossSigninUrl)
      response.cookies.delete('next')
      return response
    } else {
      return NextResponse.redirect(new URL(_next, req.nextUrl))
    }
  } else {
    const sessionToken = searchParams.get('session-token')
    const nextUrl = new URL(searchParams.get('next') || '/', req.nextUrl)

    const response = NextResponse.redirect(nextUrl)
    response.cookies.set(nextAuthSessionCookie, sessionToken, {
      secure: secureCookie,
      domain: hostname.split(':')[0],
      httpOnly: true,
    })
    return response
  }
}

/**
 * Handle pathname='/api/auth'
 * @param req
 * @returns
 */
function handleCrossSiteAuth(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host')
  const isAppDomain = isMainAppDomain(hostname)
  const searchParams = req.nextUrl.searchParams

  if (!isAppDomain) {
    // All authentication will occur on the main app domain
    searchParams.set('origin_host', hostname)

    const nextUrl = new URL(
      `${
        req.nextUrl.protocol
      }//${MAIN_APP_DOMAIN}${pathname}?${searchParams.toString()}`,
      req.nextUrl
    )

    const response = NextResponse.rewrite(nextUrl)

    if (pathname.includes('/login')) {
      response.cookies.set('next-auth.callback-url-host', hostname)
    }

    return response
  }

  return NextResponse.next()
}

/**
 * This function can be marked `async` if using `await` inside
 *
 * @param req
 * @returns
 */
export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  // Get the pathname of the req (e.g. /, /about, /blog/first-post)
  const pathname = url.pathname

  // Get hostname of req (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host') || 'app.nymhq.com'

  if (pathname.startsWith('/login')) {
    return handleCrossSiteLogin(req)
  } else if (pathname.startsWith('/signin-complete')) {
    return handleCrossSiteSigninComplete(req)
  } else if (pathname.startsWith('/api/auth')) {
    return handleCrossSiteAuth(req)
  }

  if (isMainAppDomain(hostname)) {
    // App Domain: Mapping of /account to /admin
    // Rewrite to "/app/**"
    url.pathname = `/app${pathname.replace('/admin', '/account')}`
    return NextResponse.rewrite(url)
  } else {
    // rewrite everything else to `/_sites/[site] dynamic route
    return NextResponse.rewrite(
      new URL(`/_sites/${hostname}${pathname}`, req.url)
    )
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /examples (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
}
