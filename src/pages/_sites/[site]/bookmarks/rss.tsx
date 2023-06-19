import * as React from 'react'

import { getContext } from '~/graphql/context'
import { generateBookmarkRSS } from '~/lib/rss'

const RSSFeed: React.FC = () => null

export async function getServerSideProps(ctx) {
  const { req, res } = ctx
  const context = await getContext(ctx)

  const { rss } = await generateBookmarkRSS(context)

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
