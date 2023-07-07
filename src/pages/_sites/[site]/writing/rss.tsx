import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { getContext } from '~/graphql/context'
import prisma from '~/lib/prisma'
import { generatePostRSS } from '~/lib/rss'

const RSSFeed: React.FC = () => null

export const config = {
  runtime: 'nodejs',
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx
  const context = await getContext(ctx, prisma)

  const { rss } = await generatePostRSS(context)

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
