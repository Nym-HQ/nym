import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

export function requiresAdmin(fn) {
  return function resolve(parent, args, context) {
    if (context?.viewer?.isAdmin) {
      return fn(parent, args, context)
    }

    throw new GraphQLError('You can’t do that!', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }
}
