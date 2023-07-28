import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

export function requiresAdmin(fn) {
  return function resolve(parent, args, context) {
    if (context?.viewer?.isAdmin) {
      return fn(parent, args, context)
    }

    throw new GraphQLError(
      'Admin privilege is required to perform this query/mutation!',
      {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      }
    )
  }
}
