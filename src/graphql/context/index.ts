import { PrismaClient, Site, SiteRole, UserSite } from '@prisma/client'

import { User, UserRole } from '~/graphql/types.generated'
import { isAuthenticatedServerSide } from '~/lib/auth/nextauth'
import { getSiteByDomain, getUserSiteById } from '~/lib/multitenancy/server'
import { prisma } from '~/lib/prisma'

async function getViewer(ctx) {
  const viewer = await isAuthenticatedServerSide(ctx)

  return viewer
    ? {
        ...viewer,
        isAdmin: viewer?.role === UserRole.Admin,
      }
    : null
}

async function getSite(ctx) {
  const site = await getSiteByDomain(ctx.req.headers.host)
  if (site) {
    site.parkedDomain =
      site.parkedDomain && site.parkedDomain.indexOf('.') >= 0
        ? site.parkedDomain
        : null
  }
  return site
}

export async function getContext(ctx) {
  const site = await getSite(ctx)
  const viewer = await getViewer(ctx)
  const userSite =
    site && viewer ? await getUserSiteById(viewer.id, site.id) : null
  if (viewer) {
    if (site) {
      // on sites, check siteRole
      viewer.isAdmin = !!(
        userSite &&
        (userSite.siteRole === SiteRole.ADMIN ||
          userSite.siteRole === SiteRole.OWNER)
      )
    } else {
      // on app site, check user role
      viewer.isAdmin = viewer.role === UserRole.Admin
    }
  }

  return {
    viewer,
    site,
    userSite,
    prisma,
  }
}

export type Context = {
  prisma: PrismaClient
  viewer: User | null
  site: Site | null
  userSite: UserSite | null
}
