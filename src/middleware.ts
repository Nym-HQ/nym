// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

import { isTrustedPlatformHost, parseNextParam } from '~/lib/auth/nextTarget'
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
      const parsed = parseNextParam(searchParams.get('next'))
      if (parsed.kind !== 'invalid') {
        response.cookies.set('next', searchParams.get('next'))
      }
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

async function isAllowedNextHost(req: NextRequest, host: string) {
  if (isTrustedPlatformHost(host)) return true

  try {
    const checkUrl = req.nextUrl.clone()
    checkUrl.pathname = '/api/auth/registered-host'
    checkUrl.search = ''
    checkUrl.searchParams.set('host', host)
    const result = await fetch(checkUrl)
    if (!result.ok) return false
    const data = await result.json()
    return data?.allowed === true
  } catch {
    return false
  }
}

function fallbackHome(req: NextRequest) {
  return NextResponse.redirect(new URL('/', req.nextUrl))
}

/**
 * Handle pathname='/signin-complete'
 * @param req
 * @returns
 */
async function handleCrossSiteSigninComplete(req: NextRequest) {
  const { url, host, isAppDomain } = getCurrentUrl(req)
  const searchParams = url.searchParams

  if (isAppDomain) {
    // OAuth happens on main app domain
    // So when auth completes, it will be redirected to /signin-complete
    // Here we check the "next" param and redirect accordingly.
    const rawNext =
      searchParams.get('next') || req.cookies.get('next')?.value || '/'
    const parsed = parseNextParam(rawNext)

    if (parsed.kind === 'invalid') {
      const response = fallbackHome(req)
      response.cookies.delete('next')
      return response
    }

    if (parsed.kind === 'relative') {
      const response = NextResponse.redirect(new URL(parsed.path, req.nextUrl))
      response.cookies.delete('next')
      return response
    }

    if (isMainAppDomain(parsed.url.host)) {
      const response = NextResponse.redirect(parsed.url)
      response.cookies.delete('next')
      return response
    }

    const allowed = await isAllowedNextHost(req, parsed.url.host)
    if (!allowed) {
      const response = fallbackHome(req)
      response.cookies.delete('next')
      return response
    }

    // The login code is issued by a Node API route (DB-backed, single use,
    // 60 s). The main-domain session token never goes into the URL.
    // Built from the request Host header so the
    // main-domain session cookie is sent to the issue route.
    const issueUrl = new URL('/api/auth/cross-site/issue', url)
    issueUrl.searchParams.set('next', parsed.url.toString())

    const response = NextResponse.redirect(issueUrl)
    response.cookies.delete('next')
    return response
  }

  // Tenant host: hand the code to the Node API route that redeems it
  // server-side and sets this host's own session cookie.
  const redeemUrl = new URL(url.toString())
  redeemUrl.pathname = '/api/auth/cross-site/redeem'
  const response = NextResponse.redirect(redeemUrl)
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('Cache-Control', 'no-store')
  return response
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

  // Build rewrite targets from req.nextUrl (the server's own internal origin).
  // Next 16 treats NextResponse.rewrite() to an absolute URL whose origin isn't
  // the server origin as an external proxy, which loops on the custom multi-tenant
  // host (app.nymhq.local) — getCurrentUrl()'s `url` has host overwritten, so it
  // must NOT be used as a rewrite target.
  if (isAppDomain) {
    // App Domain: Mapping of /account to /admin
    // Rewrite to "/app/**"
    const rewriteUrl = req.nextUrl.clone()
    rewriteUrl.pathname = `/app${pathname.replace('/admin', '/account')}`
    return NextResponse.rewrite(rewriteUrl)
  } else {
    // rewrite everything else to `/_sites/[site] dynamic route
    const rewriteUrl = req.nextUrl.clone()
    rewriteUrl.pathname = `/_sites/${host.split(':')[0]}${pathname}`
    return NextResponse.rewrite(rewriteUrl)
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
