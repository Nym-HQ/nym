import { NYM_APP_SITE } from '~/graphql/constants'
import { Context } from '~/graphql/context'
import {
  GetPageQueryVariables,
  GetPagesQueryVariables,
} from '~/graphql/types.generated'

export async function getPages(_, args: GetPagesQueryVariables, ctx: Context) {
  const { filter } = args
  const { prisma, viewer, site } = ctx
  const {
    published,
    featuredOnly = true,
    includeHomepage = false,
  } = filter || {}

  if (!site || site.id === NYM_APP_SITE.id) {
    return []
  }

  return await prisma.page.findMany({
    orderBy: published ? { publishedAt: 'desc' } : { createdAt: 'desc' },
    where: {
      featured: featuredOnly ? true : undefined,
      path: includeHomepage ? undefined : { not: '/' },
      siteId: site.id,

      ...(!published && viewer?.isAdmin
        ? {
            OR: [
              { publishedAt: { equals: null } },
              { publishedAt: { gte: new Date() } },
            ],
          }
        : { publishedAt: { not: null, lt: new Date() } }),
    },
  })
}

export async function getPage(
  _,
  { slug }: GetPageQueryVariables,
  ctx: Context
) {
  const { prisma, viewer, site } = ctx

  if (!site || site.id === NYM_APP_SITE.id) {
    return null
  }

  let page = await prisma.page.findFirst({
    where: {
      OR: [{ slug }, { path: slug }],
      siteId: site.id,
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

  // Unpublished pages are only visible to admins
  if (!page?.publishedAt && !viewer?.isAdmin) {
    return null
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

  if (!site || site.id === NYM_APP_SITE.id) {
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
