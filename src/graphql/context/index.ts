import { PrismaClient, SiteRole, UserSite } from '@prisma/client'

import { Site, User, UserRole } from '~/graphql/types.generated'
import { getSiteOwner, getUserSiteById } from '~/lib/multitenancy/server'

import getSite from './getSite'
import getViewer from './getViewer'

export async function getContext(ctx, prisma: PrismaClient): Promise<Context> {
  const site = await getSite(ctx.req)
  const viewer = await getViewer(ctx)

  // for a new visitor, create a user-site record with the role USER
  const userSite =
    site && viewer
      ? await getUserSiteById(viewer.id, site.id, SiteRole.USER)
      : null
  if (viewer) {
    // on app site, check user role
    viewer.isAdmin =
      viewer.role === UserRole.Admin ||
      userSite?.siteRole === SiteRole.ADMIN ||
      userSite?.siteRole === SiteRole.OWNER
  }
  const owner = site
    ? userSite?.siteRole === SiteRole.OWNER
      ? viewer
      : await getSiteOwner(site?.id)
    : null

  return {
    viewer,
    site,
    userSite,
    prisma,
    owner,
  } as Context
}

export type Context = {
  prisma: PrismaClient
  viewer: User | null
  site: Site | null
  userSite: UserSite | null
  owner: User | null
}
