import { createHash, randomBytes } from 'node:crypto'

/**
 * Cross-site login codes.
 *
 * OAuth only happens on the main app domain. To sign the user in on a tenant
 * host (custom domain or subdomain), the main domain issues a short-lived,
 * single-use, opaque code that is passed to the tenant host in a URL. The
 * tenant host redeems it server-side, which mints a NEW session for that host.
 *
 * The code itself carries no data: it is 32 random bytes. Only its SHA-256
 * hash is stored server-side (VerificationToken table, `xsite|` identifier
 * prefix), so the raw code is never persisted and the main-domain session
 * token never leaves the main domain.
 */

export const CROSS_SITE_CODE_TTL_MS = 60 * 1000
export const CROSS_SITE_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

const IDENTIFIER_PREFIX = 'xsite|v1|'
const CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/

export type CrossSiteCodeRecord = {
  identifier: string
  expires: Date
}

export interface CrossSiteLoginStore {
  /** Persist a code record keyed by the code's hash. */
  saveCode(tokenHash: string, record: CrossSiteCodeRecord): Promise<void>
  /**
   * Atomically remove the code record and return it. Must return null if the
   * record does not exist or another caller already removed it.
   */
  takeCode(tokenHash: string): Promise<CrossSiteCodeRecord | null>
  /** Create a database session row for the user. */
  createSession(session: {
    sessionToken: string
    userId: string
    expires: Date
  }): Promise<void>
}

export function hashCrossSiteCode(code: string) {
  return createHash('sha256').update(code).digest('hex')
}

function normalizeHost(host: string) {
  return host.trim().toLowerCase()
}

function buildIdentifier(host: string, userId: string, sessionExpires: Date) {
  return `${IDENTIFIER_PREFIX}${normalizeHost(
    host
  )}|${userId}|${sessionExpires.getTime()}`
}

function parseIdentifier(identifier: string) {
  if (!identifier.startsWith(IDENTIFIER_PREFIX)) return null
  const [host, userId, expiresMs] = identifier
    .slice(IDENTIFIER_PREFIX.length)
    .split('|')
  const sessionExpiresMs = Number(expiresMs)
  if (!host || !userId || !Number.isFinite(sessionExpiresMs)) return null
  return { host, userId, sessionExpires: new Date(sessionExpiresMs) }
}

export async function issueCrossSiteLoginCode(
  store: CrossSiteLoginStore,
  args: {
    userId: string
    destHost: string
    /** Expiry of the main-domain session; the new session never outlives it. */
    sessionExpires: Date
    now?: number
  }
) {
  const now = args.now ?? Date.now()
  if (!args.userId || !args.destHost) return null
  if (args.sessionExpires.getTime() <= now) return null

  const sessionExpires = new Date(
    Math.min(args.sessionExpires.getTime(), now + CROSS_SITE_SESSION_MAX_AGE_MS)
  )
  const code = randomBytes(32).toString('base64url')
  await store.saveCode(hashCrossSiteCode(code), {
    identifier: buildIdentifier(args.destHost, args.userId, sessionExpires),
    expires: new Date(now + CROSS_SITE_CODE_TTL_MS),
  })
  return code
}

export async function redeemCrossSiteLoginCode(
  store: CrossSiteLoginStore,
  args: {
    code: string | null | undefined
    host: string
    now?: number
  }
) {
  const now = args.now ?? Date.now()
  const { code } = args
  if (!code || !CODE_PATTERN.test(code)) return null

  // Remove first: a code is burned on its first redemption attempt, even if
  // that attempt is rejected (expired / wrong host).
  const record = await store.takeCode(hashCrossSiteCode(code))
  if (!record) return null
  if (record.expires.getTime() <= now) return null

  const parsed = parseIdentifier(record.identifier)
  if (!parsed) return null
  if (parsed.host !== normalizeHost(args.host)) return null
  if (parsed.sessionExpires.getTime() <= now) return null

  const sessionToken = randomBytes(32).toString('hex')
  await store.createSession({
    sessionToken,
    userId: parsed.userId,
    expires: parsed.sessionExpires,
  })
  return { sessionToken, expires: parsed.sessionExpires }
}
