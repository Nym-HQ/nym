import * as React from 'react'

import { getContext } from '~/graphql/context'
import { GET_POSTS } from '~/graphql/queries/posts'
import { initApolloClient } from '~/lib/apollo'
import { generateRSS } from '~/lib/rss'

const AtomFeed: React.FC = () => null

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
  const { atom } = await generateRSS(posts, context)

  if (res) {
    res.setHeader('Content-Type', 'text/xml')
    res.write(atom)
    res.end()
  }

  return {
    props: {},
  }
}

export default AtomFeed
