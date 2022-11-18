import { UserInputError } from 'apollo-server-micro'

import { Context } from '~/graphql/context'
import {
  Bookmark,
  CommentType,
  QueryCommentArgs,
} from '~/graphql/types.generated'

export async function getComment(_, args: QueryCommentArgs, ctx: Context) {
  const { id } = args
  const { prisma, site } = ctx

  if (!site) {
    return null
  }

  return await prisma.comment.findFirst({ where: { id, siteId: site.id } })
}

export async function getCommentAuthor(parent: Bookmark, _, ctx: Context) {
  const { id } = parent
  const { prisma, site } = ctx

  if (!site) {
    return null
  }

  return await prisma.comment
    .findFirst({ where: { id, siteId: site.id } })
    .author()
}

export async function getComments(_, args, ctx: Context) {
  const { refId, type } = args
  const { prisma, site } = ctx

  if (!refId || !type || !site) {
    return []
  }

  switch (type) {
    case CommentType.Bookmark: {
      const results = await prisma.bookmark
        .findFirst({ where: { id: refId, siteId: site.id } })
        .comments()

      return results || []
    }
    case CommentType.Question: {
      const results = await prisma.question
        .findFirst({ where: { id: refId, siteId: site.id } })
        .comments()

      return results || []
    }
    case CommentType.Post: {
      const results = await prisma.post
        .findFirst({ where: { id: refId, siteId: site.id } })
        .comments()

      return results || []
    }
    default: {
      return []
    }
  }
}
