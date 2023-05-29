import { PrismaClient, SiteRole, UserSite } from '@prisma/client'

import { Site, User, UserRole } from '~/graphql/types.generated'
import { isAuthenticatedServerSide } from '~/lib/auth/nextauth'
import { isMainAppDomain } from '~/lib/multitenancy/client'
import {
  getSiteByDomain,
  getSiteOwner,
  getUserSiteById,
} from '~/lib/multitenancy/server'
import prisma from '~/lib/prisma'

import { NYM_APP_SITE } from '../constants'

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
  if (isMainAppDomain(ctx.req.headers.host)) {
    return NYM_APP_SITE as Site
  }

  const site = await getSiteByDomain(ctx.req.headers.host)
  if (site) {
    // fix parkedDomain, as we are filling them with subdomain values
    // if they are empty just to make it compliant with unique constraint.
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
  }
}

export type Context = {
  prisma: PrismaClient
  viewer: User | null
  site: Site | null
  userSite: UserSite | null
  owner: User | null
}
