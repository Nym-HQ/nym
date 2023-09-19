import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { getContext } from '~/graphql/context'
import prisma from '~/lib/prisma'
import { generateBookmarkRSS } from '~/lib/rss'

export const config = {
  runtime: 'nodejs',
}

const RSSFeed: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx
  const context = await getContext(ctx, prisma)

  try {
    const { rss } = await generateBookmarkRSS(context)
    console.log(`RSS feed generated: ${rss.length} bytes`)

    if (res) {
      res.setHeader('Content-Type', 'text/xml')
      res.write(rss)
      res.end()
    }
  } catch (err) {
    console.error(err)
  }

  return {
    props: {},
  }
}

export default RSSFeed
