import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { Context } from '~/graphql/context'
import {
  CommentType,
  MutationAddCommentArgs,
  MutationDeleteCommentArgs,
  MutationEditCommentArgs,
} from '~/graphql/types.generated'
import { graphcdn } from '~/lib/graphcdn'
import { getSiteDomain } from '~/lib/multitenancy/client'
import { emailToSiteOwner } from '~/lib/system_emails'

export async function editComment(
  _,
  args: MutationEditCommentArgs,
  ctx: Context
) {
  const { id, text } = args
  const { prisma, viewer } = ctx

  if (!text || text.length === 0)
    throw new GraphQLError('Comment can’t be blank', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  const comment = await prisma.comment.findUnique({
    where: { id },
  })

  if (!comment)
    throw new GraphQLError('Comment does’t exist', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  if (comment.userId !== viewer?.id) {
    throw new GraphQLError('You can’t edit this comment', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }

  return await prisma.comment
    .update({
      where: { id },
      data: { text },
    })
    .then((comment) => {
      graphcdn.purgeList('comments')
      return comment
    })
    .catch((err) => {
      console.error({ err })
      throw new GraphQLError('Unable to edit comment', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })
}

export async function addComment(
  _,
  args: MutationAddCommentArgs,
  ctx: Context
) {
  const { refId, type, text } = args
  const { viewer, prisma, site, owner } = ctx

  const trimmedText = text.trim()

  if (trimmedText.length === 0)
    throw new GraphQLError('Comments can’t be blank', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  let field
  let table
  let route
  switch (type) {
    case CommentType.Bookmark: {
      field = 'bookmarkId'
      table = 'bookmark'
      route = `https://${getSiteDomain(site)}/bookmarks/${refId}`
      break
    }
    case CommentType.Post: {
      field = 'postId'
      table = 'post'
      route = `https://${getSiteDomain(site)}/writing/${refId}`
      break
    }
    case CommentType.Question: {
      field = 'questionId'
      table = 'question'
      route = `https://${getSiteDomain(site)}/qa/${refId}`
      break
    }
    default: {
      throw new GraphQLError('Invalid comment type', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    }
  }

  const parentObject = await prisma[table].findUnique({ where: { id: refId } })

  if (!parentObject) {
    throw new GraphQLError('Commenting on something that doesn’t exist', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }

  if (!viewer.isAdmin) {
    emailToSiteOwner({
      site,
      owner,
      subject: `New comment on ${table}`,
      body: `${text}\n\n${route}`,
    })
  }

  const [comment] = await Promise.all([
    prisma.comment.create({
      data: {
        text,
        userId: viewer.id,
        [field]: refId,
        siteId: site.id,
      },
    }),
    prisma[table].update({
      where: {
        id: refId,
      },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]).catch((err) => {
    console.error({ err })
    throw new GraphQLError('Unable to add comment', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  })

  graphcdn.purgeList('comments')

  return comment
}

export async function deleteComment(
  _,
  args: MutationDeleteCommentArgs,
  ctx: Context
) {
  const { id } = args
  const { prisma, viewer } = ctx

  const comment = await prisma.comment.findUnique({
    where: { id },
  })

  // comment doesn't exist, already deleted
  if (!comment) return true
  // no permission
  if (comment.userId !== viewer?.id && !viewer?.isAdmin) {
    throw new GraphQLError('You can’t delete this comment', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }

  return await prisma.comment
    .delete({
      where: { id },
    })
    .then(() => {
      graphcdn.purgeList('comments')
      return true
    })
    .catch((err) => {
      console.error({ err })
      throw new GraphQLError('Unable to delete comment', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })
}
