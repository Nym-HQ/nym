import { SiteRole } from '@prisma/client'

import { PRESERVED_SUBDOMAINS } from '~/config/tenants'
import { NYM_APP_SITE } from '~/graphql/constants'
import prisma from '~/lib/prisma'

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
      include: {
        chatbot: true,
      },
    })
  } else {
    return await prisma.site.findFirst({
      where: {
        parkedDomain: domain,
      },
      include: {
        chatbot: true,
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
export async function getUserSiteById(
  userId: string,
  siteId: string,
  createIfNotExistsWithRole: SiteRole = null
) {
  if (siteId === NYM_APP_SITE.id) return null
  let userSite = await prisma.userSite.findFirst({
    where: {
      userId: userId,
      siteId: siteId,
    },
  })
  if (!userSite && createIfNotExistsWithRole) {
    userSite = await prisma.userSite.create({
      data: {
        userId: userId,
        siteId: siteId,
        siteRole: createIfNotExistsWithRole,
      },
    })
  }
  return userSite
}

/**
 * Find Site object from the domain name
 *
 * @param domain
 * @returns
 */
export async function getSiteOwner(siteId: string) {
  if (siteId === NYM_APP_SITE.id) return null
  const userSite = await prisma.userSite.findFirst({
    where: {
      siteRole: SiteRole.OWNER,
      siteId: siteId,
    },
  })
  return userSite
    ? await prisma.user.findUnique({ where: { id: userSite.userId } })
    : null
}

export function isUserSite(site: any): boolean {
  return site && site.id !== NYM_APP_SITE.id
}
