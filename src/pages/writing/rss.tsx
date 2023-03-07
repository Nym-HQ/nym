import * as React from 'react'

import { getContext } from '~/graphql/context'
import { getPosts } from '~/graphql/resolvers/queries/posts'
import { generateRSS } from '~/lib/rss'

const RSSFeed: React.FC = () => null

export async function getServerSideProps(ctx) {
  const { req, res } = ctx
  const context = await getContext(ctx)
  const posts = await getPosts(null, { filter: { published: true } }, context)
  const { rss } = await generateRSS(posts, context)

  if (res) {
    res.setHeader('Content-Type', 'text/xml')
    res.write(rss)
    res.end()
  }

  return {
    props: {},
  }
}

export default RSSFeed
