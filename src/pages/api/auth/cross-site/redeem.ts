import { NextApiRequest, NextApiResponse } from 'next'

import { redeemCrossSiteLoginCode } from '~/lib/auth/crossSiteLoginCode'
import { prismaCrossSiteLoginStore } from '~/lib/auth/crossSiteLoginStore'
import {
  parseNextParam,
  safeRelativePathFromAbsolute,
} from '~/lib/auth/nextTarget'
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_SECURE,
} from '~/lib/auth/sessionCookie'
import { isMainAppDomain } from '~/lib/multitenancy/client'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

function safeDestPath(rawNext: string | null, host: string) {
  const parsed = parseNextParam(rawNext)
  const path =
    parsed.kind === 'relative'
      ? parsed.path
      : parsed.kind === 'absolute'
      ? safeRelativePathFromAbsolute(parsed.url, host)
      : '/'
  // Never emit a protocol-relative or backslash path (open redirect).
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return '/'
  }
  return path
}

/**
 * Tenant host only. Redeems a single-use cross-site login code server-side,
 * creates a new session for this host, and sets this host's session cookie.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Referrer-Policy', 'no-referrer')

  if (req.method !== 'GET') return res.status(405).end()

  const host = (req.headers.host || '').toLowerCase()
  if (!host || isMainAppDomain(host)) return res.redirect(302, '/')

  const code =
    typeof req.query['login-code'] === 'string' ? req.query['login-code'] : null
  const rawNext = typeof req.query.next === 'string' ? req.query.next : null

  try {
    const result = await redeemCrossSiteLoginCode(
      prismaCrossSiteLoginStore(prisma),
      { code, host }
    )
    if (!result) return res.redirect(302, '/login')

    res.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${
        result.sessionToken
      }; Path=/; Expires=${result.expires.toUTCString()}; HttpOnly; SameSite=Lax${
        SESSION_COOKIE_SECURE ? '; Secure' : ''
      }`
    )
    return res.redirect(302, safeDestPath(rawNext, host))
  } catch (err) {
    console.error('Cross-site login code redeem failed', (err as Error)?.name)
    return res.redirect(302, '/login')
  }
}
