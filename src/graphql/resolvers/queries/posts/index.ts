import { NYM_APP_SITE } from '~/graphql/constants'
import { Context } from '~/graphql/context'
import {
  GetPostQueryVariables,
  GetPostsQueryVariables,
} from '~/graphql/types.generated'

export async function getPosts(_, args: GetPostsQueryVariables, ctx: Context) {
  const { filter } = args
  const { prisma, viewer, site } = ctx
  const published = filter?.published

  if (!site || site.id === NYM_APP_SITE.id) {
    return []
  }

  return await prisma.post.findMany({
    orderBy: published ? { publishedAt: 'desc' } : { createdAt: 'desc' },
    where: {
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
  const { prisma, viewer, site } = ctx

  if (!site || site.id === NYM_APP_SITE.id) {
    return null
  }

  let post = await prisma.post.findFirst({
    where: {
      slug: slug,
      siteId: site.id,
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

  // Unpublished posts are only visible to admins
  if (!post?.publishedAt && !viewer?.isAdmin) {
    return null
  }

  return post
}
