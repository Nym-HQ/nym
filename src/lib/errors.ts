import { GraphQLError } from 'graphql'

export class ApplicationError extends Error {
  constructor(message: string, public data: Record<string, any> = {}) {
    super(message)
  }
}

export class UserError extends ApplicationError {}

export class AuthorizationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: 'FORBIDDEN' },
    })
  }
}

// You can add other custom errors here as needed
