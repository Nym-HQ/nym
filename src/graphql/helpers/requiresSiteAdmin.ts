import { ApolloServerErrorCode } from '@apollo/server/errors'
import { SiteRole } from '@prisma/client'
import { GraphQLError } from 'graphql'

export function requiresSiteAdmin(fn) {
  return function resolve(parent, args, context) {
    if (
      context?.viewer?.isAdmin ||
      context?.userSite?.siteRole === SiteRole.ADMIN ||
      context?.userSite?.siteRole === SiteRole.OWNER
    ) {
      return fn(parent, args, context)
    }

    throw new GraphQLError('You can’t do that!', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }
}
