import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'

import { Context, getContext } from '~/graphql/context'
import withRateLimit from '~/graphql/helpers/withRateLimit'
import resolvers from '~/graphql/resolvers'
import typeDefs from '~/graphql/typeDefs'

const apolloServer = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  introspection: true,
})

export const config = {
  api: {},
}

let started = false

export default withRateLimit(async (req, res) => {
  console.log('/api/graphql request')
  if (!started) {
    await apolloServer.start()
    started = true
  }

  const middleware = expressMiddleware(apolloServer, {
    // A named context function is required if you are not
    // using ApolloServer<BaseContext>
    context: async (ctx) => await getContext(ctx),
  })

  await middleware(req, res, () => res.next())
})
