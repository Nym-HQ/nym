// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

import { isMainAppDomain, MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

function getCurrentUrl(req: NextRequest) {
  // Get host of req (e.g. demo.vercel.pub, demo.localhost:3000)
  const host = req.headers.get('host') || 'app.nymhq.com'
  const url = new URL(req.nextUrl)
  url.host = host

  return {
    url,
    host,
    pathname: url.pathname, // Get the pathname of the req (e.g. /, /about, /blog/first-post)
    isAppDomain: isMainAppDomain(host),
  }
}

/**
 * Handle pathname='/login'
 * @param req
 * @returns
 */
function handleCrossSiteLogin(req: NextRequest) {
  const { url, host, pathname, isAppDomain } = getCurrentUrl(req)
  const searchParams = url.searchParams

  if (isAppDomain) {
    const response = NextResponse.next()

    // Set the "next" into cookies to redirect after login
    if (searchParams && searchParams.get('next')) {
      response.cookies.set('next', searchParams.get('next'))
    }

    return response
  } else {
    // Sign-in page should always visible on the main app domain only
    const nextUrl = new URL(
      `${url.protocol}//${MAIN_APP_DOMAIN}/login?next=${encodeURIComponent(
        `${url.protocol}//${host}`
      )}`,
      url
    )
    const response = NextResponse.redirect(nextUrl)
    return response
  }
}

/**
 * Handle pathname='/signin-complete'
 * @param req
 * @returns
 */
function handleCrossSiteSigninComplete(req: NextRequest) {
  const { url, host, pathname, isAppDomain } = getCurrentUrl(req)
  const searchParams = url.searchParams

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

    if (
      _next &&
      !_next.startsWith('/') &&
      !isMainAppDomain(new URL(_next).host)
    ) {
      const nextUrl = new URL(_next)
      const crossSigninUrl = new URL(
        `${nextUrl.protocol}//${
          nextUrl.host
        }/signin-complete?next=${encodeURIComponent(
          nextUrl.toString()
        )}&session-token=${req.cookies.get(nextAuthSessionCookie)}`
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
      domain: host.split(':')[0],
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
  const { url, host, pathname, isAppDomain } = getCurrentUrl(req)
  const searchParams = url.searchParams

  if (!isAppDomain) {
    // All authentication will occur on the main app domain
    searchParams.set('origin_host', host)

    const nextUrl = new URL(
      `${
        req.nextUrl.protocol
      }//${MAIN_APP_DOMAIN}${pathname}?${searchParams.toString()}`,
      req.nextUrl
    )

    const response = NextResponse.redirect(nextUrl)

    if (pathname.includes('/login')) {
      response.cookies.set('next-auth.callback-url-host', host)
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
  const { url, host, pathname, isAppDomain } = getCurrentUrl(req)

  if (pathname.startsWith('/login')) {
    return handleCrossSiteLogin(req)
  } else if (pathname.startsWith('/signin-complete')) {
    return handleCrossSiteSigninComplete(req)
  } else if (pathname.startsWith('/api/auth')) {
    return handleCrossSiteAuth(req)
  }

  if (isAppDomain) {
    // App Domain: Mapping of /account to /admin
    // Rewrite to "/app/**"
    url.pathname = `/app${pathname.replace('/admin', '/account')}`
    return NextResponse.rewrite(url)
  } else {
    // rewrite everything else to `/_sites/[site] dynamic route
    return NextResponse.rewrite(
      new URL(`/_sites/${host.split(':')[0]}${pathname}`, req.url)
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
