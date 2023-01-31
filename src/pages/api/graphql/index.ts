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

export default withRateLimit(async (req, res) => {
  await apolloServer.start();

  const middleware = expressMiddleware(apolloServer, {
    // A named context function is required if you are not
    // using ApolloServer<BaseContext>
    context: async (ctx) => await getContext(ctx),
  });

  await middleware(req, res, () => {})
})
