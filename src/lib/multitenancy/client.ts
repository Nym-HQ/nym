export const MAIN_APP_DOMAIN = `app.${process.env.NEXT_PUBLIC_DOMAIN}`
export const TENANT_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN

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
