import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'

import { baseEmail } from '~/config/seo'
import { CLIENT_URL, IS_PROD } from '~/graphql/constants'
import { Context } from '~/graphql/context'
import { MutationEditUserArgs } from '~/graphql/types.generated'
import { client as postmark } from '~/lib/postmark'
import { validEmail, validUsername } from '~/lib/validators'

export async function deleteUser(_req, _args, ctx: Context) {
  const { prisma, viewer } = ctx

  if (viewer.isAdmin) {
    throw new GraphQLError('Admins can’t be deleted', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }

  return await prisma.user
    .delete({
      where: { id: viewer.id },
    })
    .then(() => true)
}

export async function editUser(_, args: MutationEditUserArgs, ctx: Context) {
  const { prisma, viewer } = ctx
  const { data } = args
  const { username, email } = data

  if (username) {
    if (!validUsername(username)) {
      throw new GraphQLError('Usernames can be 16 characters long', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (user && user.id !== viewer.id) {
      throw new GraphQLError('That username is taken', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    }

    return await prisma.user.update({
      where: { id: viewer.id },
      data: { username },
    })
  }

  if (email) {
    if (!validEmail(email)) {
      throw new GraphQLError('That email is not valid', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    }

    const userByEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (userByEmail && userByEmail.id !== viewer.id) {
      throw new GraphQLError('That email is taken', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    }

    // the user is updating their email to be the same thing
    if (userByEmail && userByEmail.id === viewer.id) {
      if (userByEmail.email === email) {
        return userByEmail
      }
    }

    const token = jwt.sign(
      { userId: viewer.id, pendingEmail: email },
      process.env.JWT_SIGNING_KEY
    )

    const url = `${CLIENT_URL}/api/email/confirm?token=${token}`

    if (IS_PROD) {
      postmark.sendEmailWithTemplate({
        From: baseEmail,
        To: email,
        TemplateId: 25539089,
        TemplateModel: { url },
      })
    } else {
      console.log('Sending confirmation email', {
        From: baseEmail,
        To: email,
        TemplateId: 25539089,
        TemplateModel: { url },
      })
    }

    return await prisma.user.update({
      where: { id: viewer.id },
      data: { pendingEmail: email },
    })
  }

  // if no email or username were passed, the user is trying to cancel the pending email request
  return await prisma.user.update({
    where: { id: viewer.id },
    data: { pendingEmail: null },
  })
}
