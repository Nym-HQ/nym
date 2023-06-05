import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'

import { Context } from '~/graphql/context'
import { MutationEditUserArgs } from '~/graphql/types.generated'
import { predefinedEmails } from '~/lib/system_emails'
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
  const { prisma, viewer, site } = ctx
  const { data } = args
  const { username, email, name } = data

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

    await predefinedEmails.confirmChangedEmailAddress(site, viewer, {
      email,
      token,
    })

    return await prisma.user.update({
      where: { id: viewer.id },
      data: { pendingEmail: email },
    })
  }

  if (name) {
    return await prisma.user.update({
      where: { id: viewer.id },
      data: { name },
    })
  }

  // if no email or username were passed, the user is trying to cancel the pending email request
  return await prisma.user.update({
    where: { id: viewer.id },
    data: { pendingEmail: null },
  })
}
