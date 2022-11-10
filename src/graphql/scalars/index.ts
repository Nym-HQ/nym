import { GraphQLScalarType } from 'graphql'
import { ValueNode } from 'graphql'
import { Kind } from 'graphql/language'

export const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value: string | number | Date) {
    return new Date(value) // value from the client
  },
  serialize(value: Date): number {
    return value.getTime() // value sent to the client
  },
  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)) // ast value is always in string format
    }
    return null
  },
})
