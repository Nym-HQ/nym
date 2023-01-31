import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { baseUrl } from '~/config/seo'
import { Context } from '~/graphql/context'
import {
  MutationAddQuestionArgs,
  MutationDeleteQuestionArgs,
  MutationEditQuestionArgs,
} from '~/graphql/types.generated'
import { graphcdn } from '~/lib/graphcdn'
import { emailMe } from '~/lib/postmark'

export async function editQuestion(
  _,
  args: MutationEditQuestionArgs,
  ctx: Context
) {
  const { data, id } = args
  const { prisma, viewer } = ctx

  const question = await prisma.question.findUnique({ where: { id } })
  if (!question) {
    throw new GraphQLError('Question doesn’t exist', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    });
  }

  if (viewer.isAdmin || viewer.id === question.userId) {
    return await prisma.question
      .update({
        where: { id },
        data,
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      })
      .then((question) => {
        graphcdn.purgeList('questions')
        return question
      })
      .catch((err) => {
        console.error({ err })
        throw new GraphQLError('Unable to edit question', {
          extensions: {
            code: ApolloServerErrorCode.BAD_REQUEST,
          },
        })
      })
  }

  throw new GraphQLError('No permission to delete this question', {
    extensions: {
      code: ApolloServerErrorCode.BAD_REQUEST,
    },
  })
}

export async function addQuestion(
  _,
  args: MutationAddQuestionArgs,
  ctx: Context
) {
  const { data } = args
  const { title, description } = data
  const { viewer, prisma, site } = ctx

  const question = await prisma.question
    .create({
      data: {
        title,
        description,
        userId: viewer.id,
        siteId: site.id,
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })
    .then((question) => {
      graphcdn.purgeList('questions')
      return question
    })
    .catch((err) => {
      console.error({ err })
      throw new GraphQLError('Unable to add question', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })

  emailMe({
    subject: `Q&A: ${title}`,
    body: `${title}\n\n${baseUrl}/qa/${question.id}`,
  })

  return question
}

export async function deleteQuestion(
  _,
  args: MutationDeleteQuestionArgs,
  ctx: Context
) {
  const { id } = args
  const { prisma, viewer } = ctx

  const question = await prisma.question.findUnique({ where: { id } })
  if (!question) return true

  if (viewer.isAdmin || viewer.id === question.userId) {
    return await prisma.question
      .delete({ where: { id } })
      .then(() => {
        graphcdn.purgeList('questions')
        return true
      })
      .catch((err) => {
        console.error({ err })
        throw new GraphQLError('Unable to delete question', {
          extensions: {
            code: ApolloServerErrorCode.BAD_REQUEST,
          },
        })
      })
  }

  throw new GraphQLError('No permission to delete this question', {
    extensions: {
      code: ApolloServerErrorCode.BAD_REQUEST,
    },
  })
}
