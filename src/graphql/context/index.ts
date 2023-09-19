import { PrismaClient, SiteRole, UserSite } from '@prisma/client'

import { Site, User, UserRole } from '~/graphql/types.generated'
import { getSiteOwner, getUserSiteById } from '~/lib/multitenancy/server'

import getApiViewer from './getApiViewer'
import getSite from './getSite'
import getViewer from './getViewer'

export async function getContext(
  ctx,
  prisma: PrismaClient,
  supportApiKeyAuth: boolean = false
): Promise<Context> {
  const authorizationHeader =
    typeof ctx.req.headers.get === 'function'
      ? ctx.req.headers.get('authorization') // when using 'edge' runtime
      : ctx.req.headers['authorization'] // when using 'nodejs' runtime

  const isApiViewer = supportApiKeyAuth && authorizationHeader
  const [site, viewer] = await Promise.all([
    getSite(prisma, ctx.req),
    isApiViewer
      ? getApiViewer(prisma, authorizationHeader)
      : getViewer(prisma, ctx),
  ])

  // for a new visitor, create a user-site record with the role USER
  const userSite =
    site && viewer
      ? await getUserSiteById(prisma, viewer.id, site.id, SiteRole.USER)
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
      : await getSiteOwner(prisma, site?.id)
    : null

  return {
    viewer,
    site,
    userSite,
    prisma,
    owner,
    isApiViewer,
  } as Context
}

export type Context = {
  prisma: PrismaClient
  viewer: User | null
  site: Site | null
  userSite: UserSite | null
  owner: User | null
  isApiViewer: boolean
}
