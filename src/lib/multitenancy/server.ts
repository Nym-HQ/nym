import { PRESERVED_SUBDOMAINS } from '~/config/tenants'
import { prisma } from '~/lib/prisma'

import { getSubdomain } from './client'

/**
 * Find Site object from the domain name
 *
 * @param domain
 * @returns
 */
export async function getSiteByDomain(domain: string) {
  domain = domain.toLocaleLowerCase()
  const subdomain = getSubdomain(domain)
  if (subdomain) {
    if (PRESERVED_SUBDOMAINS.includes(subdomain)) {
      return null
    }

    return await prisma.site.findFirst({
      where: {
        subdomain: subdomain,
      },
    })
  } else {
    return await prisma.site.findFirst({
      where: {
        parkedDomain: domain,
      },
    })
  }
}

/**
 * Find Site object from the domain name
 *
 * @param domain
 * @returns
 */
export async function getUserSiteById(userId: string, siteId: string) {
  return await prisma.userSite.findFirst({
    where: {
      userId: userId,
      siteId: siteId,
    },
  })
}
