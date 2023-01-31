import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

export function requiresUser(fn) {
  return function resolve(parent, args, context) {
    if (context?.viewer?.id) return fn(parent, args, context)

    throw new GraphQLError('You must be signed in to do that.', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }
}
