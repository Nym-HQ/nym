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

  try {
    const { atom } = await generateBookmarkRSS(context)
    console.log(`Atom feed generated: ${atom.length} bytes`)

    if (res) {
      res.setHeader('Content-Type', 'text/xml')
      res.write(atom)
      res.end()
    }
  } catch (err) {
    console.error(err)
  }

  return {
    props: {},
  }
}

export default AtomFeed
