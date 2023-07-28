import { ApolloServer, HeaderMap, HTTPGraphQLRequest } from '@apollo/server'

import { IS_DEV } from '~/graphql/constants'
import { Context, getContext } from '~/graphql/context'
import withRateLimit from '~/graphql/helpers/withRateLimit'
import resolvers from '~/graphql/resolvers'
import typeDefs from '~/graphql/typeDefs'
import prisma from '~/lib/prisma'

const apolloServer = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  introspection: IS_DEV,
})

export const config = {
  api: {},
  runtime: 'nodejs',
}

let apolloServerStatus = 'stopped'

const graphqlHandler = async (req, res) => {
  if (req.method === 'POST' && !req.body) {
    // The json body-parser *always* sets req.body to {} if it's unset (even
    // if the Content-Type doesn't match), so if it isn't set, you probably
    // forgot to set up body-parser. (Note that this may change in the future
    // body-parser@2.)
    res.status(500)
    res.send(
      '`req.body` is not set; this probably means you forgot to set up the ' +
        '`body-parser` middleware before the Apollo Server middleware.'
    )
    return
  }

  const headers = new HeaderMap()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      // Node/Express headers can be an array or a single value. We join
      // multi-valued headers with `, ` just like the Fetch API's `Headers`
      // does. We assume that keys are already lower-cased (as per the Node
      // docs on IncomingMessage.headers) and so we don't bother to lower-case
      // them or combine across multiple keys that would lower-case to the
      // same value.
      headers.set(
        key,
        Array.isArray(value) ? value.join(', ') : (value as any).toString()
      )
    }
  }

  const httpGraphQLRequest: HTTPGraphQLRequest = {
    method: req.method.toUpperCase(),
    headers,
    search: new URL(req.url, `https://${req.headers.host}`).search ?? '',
    body: req.body,
  }

  return apolloServer
    .executeHTTPGraphQLRequest({
      httpGraphQLRequest,
      context: async () => getContext({ req, res }, prisma, true),
    })
    .then(async (httpGraphQLResponse) => {
      httpGraphQLResponse.headers.forEach((value, key) => {
        res.setHeader(key, value)
      })
      res.statusCode = httpGraphQLResponse.status || 200

      if (httpGraphQLResponse.body.kind === 'complete') {
        res.send(httpGraphQLResponse.body.string)
        res.end()
        return
      }

      for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
        res.write(chunk)
        // Express/Node doesn't define a way of saying "it's time to send this
        // data over the wire"... but the popular `compression` middleware
        // (which implements `accept-encoding: gzip` and friends) does, by
        // monkey-patching a `flush` method onto the response. So we call it
        // if it's there.
        if (typeof (res as any).flush === 'function') {
          ;(res as any).flush()
        }
      }
      res.end()
    })
    .catch((e) => {
      console.error('graphql endpoint error', e)
      res.status(400).end()
    })
}

const lockForApolloServerStart = () => {
  if (apolloServerStatus == 'started') return Promise.resolve()
  if (apolloServerStatus == 'stopped') return Promise.reject()

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (apolloServerStatus == 'started') {
        clearInterval(interval)
        resolve(null)
      } else if (apolloServerStatus == 'stopped') {
        clearInterval(interval)
        reject(null)
      }
    }, 100)
  })
}

export default withRateLimit(async (req, res) => {
  try {
    if (apolloServerStatus == 'stopped') {
      apolloServerStatus = 'starting'
      await apolloServer.start()
      apolloServerStatus = 'started'
    } else {
      await lockForApolloServerStart()
    }
  } catch (e) {
    apolloServerStatus = 'stopped'
  }

  await graphqlHandler(req, res)
})
