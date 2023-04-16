// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

import { isMainAppDomain, MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

function handleCrossSiteAuth(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host')
  const isAppDomain = isMainAppDomain(hostname)
  const searchParams = req.nextUrl.searchParams

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
    }
  } else {
    // Sign-in page should always visible on the main app domain only
    if (pathname === '/signin') {
      const response = NextResponse.redirect(
        new URL(
          `${
            req.nextUrl.protocol
          }//${MAIN_APP_DOMAIN}/signin?next=${encodeURIComponent(
            `https://${hostname}`
          )}`,
          req.nextUrl
        )
      )
      return response
    }

    if (pathname === '/signin-complete') {
      const next = searchParams.get('next') || '/'
      const sessionToken = searchParams.get('session-token')
      const response = NextResponse.redirect(new URL(next, req.nextUrl))
      response.cookies.set(nextAuthSessionCookie, sessionToken, {
        secure: secureCookie,
        domain: hostname.split(':')[0],
        httpOnly: true,
      })
      return response
    }

    // All authentication will occur on the main app domain
    if (pathname.startsWith('/api/auth')) {
      searchParams.set('origin_host', hostname)

      const response = NextResponse.rewrite(
        new URL(
          `${
            req.nextUrl.protocol
          }//${MAIN_APP_DOMAIN}${pathname}?${searchParams.toString()}`,
          req.nextUrl
        )
      )

      if (pathname.includes('/signin')) {
        response.cookies.set('next-auth.callback-url-host', hostname)
      }

      return response
    }
  }

  return NextResponse.next()
}

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const url = req.nextUrl

  // Get hostname of req (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host') || 'app.nymhq.com'

  // Get the pathname of the req (e.g. /, /about, /blog/first-post)
  const pathname = url.pathname

  if (
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signin-complete') ||
    pathname.startsWith('/api/auth')
  ) {
    return handleCrossSiteAuth(req)
  }

  if (isMainAppDomain(hostname)) {
    if (
      url.pathname === '/login' &&
      (req.cookies.get('next-auth.session-token') ||
        req.cookies.get('__Secure-next-auth.session-token'))
    ) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // App Domain: Mapping of /account to /admin
    url.pathname = pathname.replace('/admin', '/account')

    url.pathname = `/app${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // rewrite everything else to `/_sites/[site] dynamic route
  return NextResponse.rewrite(
    new URL(`/_sites/${hostname}${pathname}`, req.url)
  )
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
