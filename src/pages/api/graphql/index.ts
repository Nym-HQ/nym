import { ApolloServer } from 'apollo-server-micro'

import { getContext } from '~/graphql/context'
import withRateLimit from '~/graphql/helpers/withRateLimit'
import resolvers from '~/graphql/resolvers'
import typeDefs from '~/graphql/typeDefs'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (ctx) => await getContext(ctx),
  introspection: true,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const startServer = apolloServer.start()

export default withRateLimit(async (req, res) => {
  await startServer
  await apolloServer.createHandler({ path: '/api/graphql' })(req, res)
})
