import { NextApiRequest, NextApiResponse } from 'next/types'

import { getContext } from '~/graphql/context'
import prisma from '~/lib/prisma'
import { generateBookmarkRSS } from '~/lib/rss'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = { req, res }
  const context = await getContext(ctx, prisma)

  try {
    const { atom } = await generateBookmarkRSS(context)

    res.setHeader('Content-Type', 'text/xml')
    res.write(atom)
  } catch (err) {
    res.write('There was an error ' + err.toString())
    console.error(err)
  }
  res.end()
}
