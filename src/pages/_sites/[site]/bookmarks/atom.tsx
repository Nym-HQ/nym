import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { getContext } from '~/graphql/context'
import prisma from '~/lib/prisma'
import { generateBookmarkRSS } from '~/lib/rss'

export const config = {
  runtime: 'nodejs',
}

const AtomFeed: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx
  const context = await getContext(ctx, prisma)

  const { atom } = await generateBookmarkRSS(context)

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
