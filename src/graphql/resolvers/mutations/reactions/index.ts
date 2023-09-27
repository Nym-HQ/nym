import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { Context } from '~/graphql/context'
import {
  MutationToggleReactionArgs,
  ReactionType,
} from '~/graphql/types.generated'

export async function toggleReaction(
  _,
  args: MutationToggleReactionArgs,
  ctx: Context
) {
  const { refId, type } = args
  const { viewer, prisma, site } = ctx

  let field
  let table
  switch (type) {
    case ReactionType.Bookmark: {
      field = 'bookmarkId'
      table = prisma.bookmark
      break
    }
    case ReactionType.Post: {
      field = 'postId'
      table = prisma.post
      break
    }
    case ReactionType.Question: {
      field = 'questionId'
      table = prisma.question
      break
    }
    default: {
      throw new GraphQLError('Invalid reaction type', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    }
  }

  const [parentObject, existingReaction] = await Promise.all([
    table.findUnique({
      where: { id: refId },
    }),

    prisma.reaction.findMany({
      where: {
        [field]: refId,
        userId: viewer.id,
      },
    }),
  ])

  if (!parentObject) {
    throw new GraphQLError('Reacting on something that doesn’t exist', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }

  let fn
  if (existingReaction.length > 0) {
    fn = () =>
      prisma.reaction.delete({
        where: {
          id: existingReaction[0].id,
        },
      })
  } else {
    fn = () =>
      prisma.reaction.create({
        data: {
          userId: viewer.id,
          [field]: refId,
          siteId: site.id,
        },
      })
  }

  return await fn()
    .then(() => {
      return { ...parentObject, reactableType: type }
    })
    .catch((err) => {
      console.error({ err })
      return { ...parentObject, reactableType: type }
    })
}
