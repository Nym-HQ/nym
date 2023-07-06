import * as React from 'react'

import { getContext } from '~/graphql/context'
import { generateBookmarkRSS } from '~/lib/rss'

export const config = {
  runtime: 'nodejs',
}

const JSONFeed: React.FC = () => null

export async function getServerSideProps(ctx) {
  const { req, res } = ctx
  const context = await getContext(ctx)

  const { json } = await generateBookmarkRSS(context)

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
