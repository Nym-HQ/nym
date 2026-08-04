// The tenant domain drives host<->site resolution. It normally comes from
// NEXT_PUBLIC_DOMAIN (set in Vercel for prod). For local dev we default to the
// standard *.nymhq.local:3000 setup so a fresh checkout / worktree works without
// having to uncomment NEXT_PUBLIC_DOMAIN in .env on every branch. The fallback
// only applies outside production, so it can never leak into a deployed build.
const DEV_TENANT_DOMAIN = 'nymhq.local:3000'
export const TENANT_DOMAIN =
  process.env.NEXT_PUBLIC_DOMAIN ||
  (process.env.NODE_ENV !== 'production' ? DEV_TENANT_DOMAIN : undefined)
export const MAIN_APP_DOMAIN = `app.${TENANT_DOMAIN}`

/**
 * Protocol to use when building absolute app URLs (cross-site auth redirects,
 * OAuth redirectUris, etc.). Honors x-forwarded-proto (Vercel/proxies set it),
 * otherwise https in production and http for local dev — which has no TLS on
 * *.nymhq.local:3000. Centralized so no call site hardcodes `https://` and
 * breaks local sign-in.
 */
export function getAppProtocol(
  forwardedProto?: string | string[] | null
): string {
  const fwd = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto
  if (fwd) return fwd.split(',')[0].trim()
  return process.env.NODE_ENV === 'production' ? 'https' : 'http'
}

export function isMainAppDomain(domain: string): boolean {
  return MAIN_APP_DOMAIN === domain
}

/**
 * Get the subdomain
 * NOTE: always in lowercase
 *
 * @param domain
 * @returns
 */
export function getSubdomain(domain: string): string {
  domain = domain.toLocaleLowerCase() // convert to lower case
  if (domain.endsWith('.' + TENANT_DOMAIN)) {
    return domain.replace('.' + TENANT_DOMAIN, '')
  }
  return null
}

export function getSiteDomain(
  site: any,
  preferParkedDomain: boolean = true
): string {
  if (preferParkedDomain && site.parkedDomain) {
    return site.parkedDomain || `${site.subdomain}.${TENANT_DOMAIN}`
  } else {
    return `${site.subdomain}.${TENANT_DOMAIN}`
  }
}
