import { PostAccess } from '@prisma/client'

import { Context } from '~/graphql/context'
import {
  GetPostQueryVariables,
  GetPostsQueryVariables,
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
    return { access: { equals: PostAccess.PUBLIC } }
  }
  // If user is a plain member (not paid), restrict to public and members-only pages
  else if (userSite?.siteRole === SiteRole.User) {
    return {
      access: { in: [PostAccess.PUBLIC, PostAccess.MEMBERS] },
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

export async function getPosts(_, args: GetPostsQueryVariables, ctx: Context) {
  const { filter } = args
  const { prisma, viewer, site, userSite } = ctx

  if (!isUserSite(site)) {
    return []
  }

  const { published, publishedFilter } = getPublishedFilter(
    viewer,
    userSite,
    filter?.published
  )
  const accessFilter = getAccessFilter(viewer, userSite)

  return await prisma.post.findMany({
    orderBy: published ? { publishedAt: 'desc' } : { createdAt: 'desc' },
    where: {
      siteId: site.id,

      ...publishedFilter,
      ...accessFilter,
    },
    include: {
      _count: {
        select: {
          reactions: true,
        },
      },
      author: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })
}

export async function getPost(
  _,
  { slug }: GetPostQueryVariables,
  ctx: Context
) {
  const { prisma, viewer, site, userSite } = ctx

  if (!isUserSite(site)) {
    return null
  }

  const publishedFilter = !viewer ? { publishedAt: { not: null } } : {}
  const accessFilter = getAccessFilter(viewer, userSite)

  let post = await prisma.post.findFirst({
    where: {
      slug: slug,
      siteId: site.id,
      ...publishedFilter,
      ...accessFilter,
    },
    include: {
      _count: {
        select: {
          reactions: true,
        },
      },
    },
  })

  // if not found by slug, fallback to id
  if (!post) {
    post = await prisma.post.findFirst({
      where: {
        id: slug,
        siteId: site.id,
        ...publishedFilter,
        ...accessFilter,
      },
      include: {
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    })
  }

  return post
}
