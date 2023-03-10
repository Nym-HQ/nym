import * as React from 'react'

import { getContext } from '~/graphql/context'
import { GET_POSTS } from '~/graphql/queries/posts'
import { initApolloClient } from '~/lib/apollo'
import { generatePostRSS } from '~/lib/rss'

const JSONFeed: React.FC = () => null

export async function getServerSideProps(ctx) {
  const { req, res } = ctx
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const {
    data: { posts },
  } = await apolloClient.query({
    query: GET_POSTS,
    variables: { filter: { published: true } },
  })
  const { json } = await generatePostRSS(posts, context)

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
