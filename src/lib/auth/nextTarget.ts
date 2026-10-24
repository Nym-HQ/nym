import { PRESERVED_SUBDOMAINS } from '~/config/tenants'
import { getSubdomain, isMainAppDomain } from '~/lib/multitenancy/client'

export type ParsedNextTarget =
  | { kind: 'relative'; path: string }
  | { kind: 'absolute'; url: URL }
  | { kind: 'invalid' }

export function parseNextParam(
  raw: string | null | undefined
): ParsedNextTarget {
  if (raw == null) return { kind: 'relative', path: '/' }

  const trimmed = raw.trim()
  if (!trimmed) return { kind: 'relative', path: '/' }

  if (trimmed.startsWith('//') || trimmed.startsWith('\\\\')) {
    return { kind: 'invalid' }
  }

  if (
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) &&
    !/^https?:\/\//i.test(trimmed)
  ) {
    return { kind: 'invalid' }
  }

  if (trimmed.startsWith('/')) {
    if (trimmed.includes('\\')) return { kind: 'invalid' }
    try {
      const decoded = decodeURIComponent(trimmed)
      if (
        decoded.startsWith('//') ||
        decoded.includes('\\') ||
        /^https?:/i.test(decoded)
      ) {
        return { kind: 'invalid' }
      }
    } catch {
      return { kind: 'invalid' }
    }
    return { kind: 'relative', path: trimmed }
  }

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { kind: 'invalid' }
    }
    if (!url.hostname) return { kind: 'invalid' }
    return { kind: 'absolute', url }
  } catch {
    return { kind: 'invalid' }
  }
}

export function isTrustedPlatformHost(host: string) {
  const normalized = host.toLowerCase()
  if (isMainAppDomain(normalized)) return true
  const subdomain = getSubdomain(normalized)
  return Boolean(subdomain && !PRESERVED_SUBDOMAINS.includes(subdomain))
}

export function parkedDomainLookupCandidates(host: string) {
  const normalized = host.toLowerCase().trim()
  const withoutPort = normalized.split(':')[0]
  return Array.from(new Set([normalized, withoutPort].filter(Boolean)))
}

export async function isRegisteredSiteHost(
  prisma: {
    site: {
      findFirst: (args: {
        where: { parkedDomain: { in: string[] } }
        select: { id: true }
      }) => Promise<{ id: string } | null>
    }
  },
  host: string
) {
  if (isTrustedPlatformHost(host)) return true

  const site = await prisma.site.findFirst({
    where: { parkedDomain: { in: parkedDomainLookupCandidates(host) } },
    select: { id: true },
  })

  return Boolean(site)
}

export function sameHost(left: string, right: string) {
  return left.toLowerCase() === right.toLowerCase()
}

export function safeRelativePathFromAbsolute(url: URL, requestHost: string) {
  if (!sameHost(url.host, requestHost)) return '/'
  return `${url.pathname}${url.search}${url.hash}` || '/'
}
