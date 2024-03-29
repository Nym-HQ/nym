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

const filterContentByAccessPerm = (viewer, userSite, page) => {
  if (
    !page ||
    page.access == PageAccess.PUBLIC ||
    userSite?.siteRole === SiteRole.Owner ||
    userSite?.siteRole === SiteRole.Admin ||
    userSite?.siteRole === SiteRole.PaidUser
  ) {
    return {
      ...page,
      _isMasked: false,
    }
  }

  if (
    page.access == PageAccess.PAID_MEMBERS ||
    (page.access == PageAccess.MEMBERS && !viewer)
  ) {
    return {
      ...page,
      _isMasked: true,
      data: JSON.stringify({
        time: new Date().getTime(),
        blocks: [
          {
            id: 'maskedcontent',
            type: 'paragraph',
            data: { text: page.excerpt },
          },
        ],
        version: '2.26.4',
      }),
    }
  }

  return {
    ...page,
    _isMasked: false,
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

  const pages = await prisma.page.findMany({
    orderBy: published ? { publishedAt: 'desc' } : { createdAt: 'desc' },
    where: {
      siteId: site.id,
      ...(featuredOnly ? { featured: true } : {}),
      ...(includeHomepage ? {} : { path: { not: '/' } }),
      ...publishedFilter,
    },
  })

  return pages.map((page) => filterContentByAccessPerm(viewer, userSite, page))
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

  let page = await prisma.page.findFirst({
    where: {
      OR: [{ slug }, { path: slug }],
      siteId: site.id,
      ...publishedFilter,
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

  return filterContentByAccessPerm(viewer, userSite, page)
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
