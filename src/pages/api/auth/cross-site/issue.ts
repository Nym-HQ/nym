import { NextApiRequest, NextApiResponse } from 'next'

import { issueCrossSiteLoginCode } from '~/lib/auth/crossSiteLoginCode'
import { prismaCrossSiteLoginStore } from '~/lib/auth/crossSiteLoginStore'
import { isRegisteredSiteHost, parseNextParam } from '~/lib/auth/nextTarget'
import { SESSION_COOKIE_NAME } from '~/lib/auth/sessionCookie'
import { isMainAppDomain } from '~/lib/multitenancy/client'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

/**
 * Main app domain only. Reached via /signin-complete?next=<tenant URL> after
 * OAuth. Issues an opaque single-use 60 s code for the tenant host and
 * redirects there to redeem it. The main-domain session token is never put in
 * the URL.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Referrer-Policy', 'no-referrer')

  if (req.method !== 'GET') return res.status(405).end()

  const requestHost = (req.headers.host || '').toLowerCase()
  if (!isMainAppDomain(requestHost)) return res.redirect(302, '/')

  const rawNext = typeof req.query.next === 'string' ? req.query.next : null
  const parsed = parseNextParam(rawNext)
  if (parsed.kind !== 'absolute' || isMainAppDomain(parsed.url.host)) {
    return res.redirect(302, '/')
  }
  const destHost = parsed.url.host.toLowerCase()

  try {
    if (!(await isRegisteredSiteHost(prisma, destHost))) {
      return res.redirect(302, '/')
    }

    const sessionToken = req.cookies[SESSION_COOKIE_NAME]
    if (!sessionToken) return res.redirect(302, '/login')

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      select: { userId: true, expires: true },
    })
    if (!session || session.expires.getTime() <= Date.now()) {
      return res.redirect(302, '/login')
    }

    const store = prismaCrossSiteLoginStore(prisma)
    await store.purgeExpired().catch(() => undefined)

    const code = await issueCrossSiteLoginCode(store, {
      userId: session.userId,
      destHost,
      sessionExpires: session.expires,
    })
    if (!code) return res.redirect(302, '/')

    const redeemUrl = new URL(
      `${parsed.url.protocol}//${destHost}/api/auth/cross-site/redeem`
    )
    redeemUrl.searchParams.set('next', parsed.url.toString())
    redeemUrl.searchParams.set('login-code', code)
    return res.redirect(302, redeemUrl.toString())
  } catch (err) {
    console.error('Cross-site login code issue failed', (err as Error)?.name)
    return res.redirect(302, '/')
  }
}
