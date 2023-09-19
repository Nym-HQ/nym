import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { getContext } from '~/graphql/context'
import prisma from '~/lib/prisma'
import { generateBookmarkRSS } from '~/lib/rss'

export const config = {
  runtime: 'nodejs',
}

const JSONFeed: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx
  const context = await getContext(ctx, prisma)

  try {
    const { json } = await generateBookmarkRSS(context)

    if (res) {
      res.setHeader('Content-Type', 'application/json')
      res.write(json)
      res.end()
    }
  } catch (err) {
    console.error(err)
  }

  return {
    props: {},
  }
}

export default JSONFeed
