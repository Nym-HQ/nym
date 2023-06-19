import * as React from 'react'

import { getContext } from '~/graphql/context'
import { generatePostRSS } from '~/lib/rss'

const AtomFeed: React.FC = () => null

export async function getServerSideProps(ctx) {
  const { req, res } = ctx
  const context = await getContext(ctx)

  const { atom } = await generatePostRSS(context)

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
