import { Context } from '~/graphql/context'
import {
  GetPostQueryVariables,
  GetPostsQueryVariables,
} from '~/graphql/types.generated'

export async function getPosts(_, args: GetPostsQueryVariables, ctx: Context) {
  const { filter } = args
  const { prisma, viewer, site } = ctx
  const published = filter?.published

  if (!site) {
    return []
  }

  return await prisma.post.findMany({
    orderBy: published ? { publishedAt: 'desc' } : { createdAt: 'desc' },
    where: {
      publishedAt:
        !published && viewer?.isAdmin ? { equals: null } : { not: null },
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

export async function getPost(
  _,
  { slug }: GetPostQueryVariables,
  ctx: Context
) {
  const { prisma, viewer, site } = ctx

  if (!site) {
    return null
  }

  const post = await prisma.post.findFirst({
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

  if (!post?.publishedAt && !viewer?.isAdmin) {
    return null
  }

  return post
}
