import * as React from 'react'

import { getContext } from '~/graphql/context'
import { GET_POSTS } from '~/graphql/queries/posts'
import { initApolloClient } from '~/lib/apollo'
import { generateRSS } from '~/lib/rss'

const JSONFeed: React.FC = () => null

export async function getInitialProps(ctx) {
  const { req, res } = ctx
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const {
    data: { posts },
  } = await apolloClient.query({
    query: GET_POSTS,
    variables: { filter: { published: true } },
  })
  const { json } = await generateRSS(posts)

  if (res) {
    res.setHeader('Content-Type', 'application/json')
    res.write(json)
    res.end()
  }

  return {
    props: {},
  }
}

export default JSONFeed
