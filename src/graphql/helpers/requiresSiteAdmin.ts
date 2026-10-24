import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { isSiteAdmin } from './isSiteAdmin'

export function requiresSiteAdmin(fn) {
  return function resolve(parent, args, context) {
    if (isSiteAdmin(context)) {
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
