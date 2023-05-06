import { PageAccess } from '@prisma/client'

import { Context } from '~/graphql/context'
import {
  GetPageQueryVariables,
  GetPagesQueryVariables,
  SiteRole,
} from '~/graphql/types.generated'
import { isUserSite } from '~/lib/multitenancy/server'

const getPublishedFilter = (viewer, userSite, published) => {
  let publishedFilter = {}
  // If not logged in, only show published pages
  // If user is a member (paid, non-paid), only show published pages
  if (!viewer || !viewer.isAdmin) {
    published = true
    publishedFilter = { publishedAt: { not: null, lt: new Date() } }
  }
  // If user is an admin, show all pages, but the "published" filter will be strict
  else if (viewer.isAdmin) {
    published = !!published
    publishedFilter = published
      ? { publishedAt: { not: null, lt: new Date() } }
      : {
          OR: [
            { publishedAt: { equals: null } },
            { publishedAt: { gte: new Date() } },
          ],
        }
  }

  return {
    published,
    publishedFilter,
  }
}

const getAccessFilter = (viewer, userSite) => {
  // If not logged in, only show public pages
  if (!viewer) {
    return { access: { equals: PageAccess.PUBLIC } }
  }
  // If user is a plain member (not paid), restrict to public and members-only pages
  else if (userSite?.siteRole === SiteRole.User) {
    return {
      access: { in: [PageAccess.PUBLIC, PageAccess.MEMBERS] },
    }
  }
  // If user is a paid member, show all pages
  else if (userSite?.siteRole === SiteRole.PaidUser) {
    return {}
  }
  // If user is a site admin, show all pages
  else if (viewer?.isAdmin) {
    return {}
  }
}

export async function getPages(_, args: GetPagesQueryVariables, ctx: Context) {
  const { filter } = args
  const { prisma, viewer, site, userSite } = ctx
  const { featuredOnly = true, includeHomepage = false } = filter || {}

  if (!isUserSite(site)) {
    return []
  }

  const { published, publishedFilter } = getPublishedFilter(
    viewer,
    userSite,
    filter?.published
  )
  const accessFilter = getAccessFilter(viewer, userSite)

  return await prisma.page.findMany({
    orderBy: published ? { publishedAt: 'desc' } : { createdAt: 'desc' },
    where: {
      featured: featuredOnly ? true : undefined,
      path: includeHomepage ? undefined : { not: '/' },
      siteId: site.id,

      ...publishedFilter,
      ...accessFilter,
    },
  })
}

export async function getPage(
  _,
  { slug }: GetPageQueryVariables,
  ctx: Context
) {
  const { prisma, viewer, site, userSite } = ctx

  if (!isUserSite(site)) {
    return null
  }

  const publishedFilter = !viewer ? { publishedAt: { not: null } } : {}
  const accessFilter = getAccessFilter(viewer, userSite)

  let page = await prisma.page.findFirst({
    where: {
      OR: [{ slug }, { path: slug }],
      siteId: site.id,
      ...publishedFilter,
      ...accessFilter,
    },
  })

  // if not found by slug, fallback to id
  if (!page) {
    page = await prisma.page.findFirst({
      where: {
        id: slug,
        siteId: site.id,
      },
    })
  }

  return page
}

/**
 * Get Published Homepage
 * @param _
 * @param _
 * @param ctx
 * @returns
 */
export async function getHomePage(_, __, ctx: Context) {
  const { prisma, viewer, site } = ctx

  if (!isUserSite(site)) {
    return null
  }

  const page = await prisma.page.findFirst({
    where: {
      path: '/',
      publishedAt: { not: null },
      siteId: site.id,
    },
  })

  return page
}
