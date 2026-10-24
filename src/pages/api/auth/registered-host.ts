import { NextApiRequest, NextApiResponse } from 'next'

import { isRegisteredSiteHost } from '~/lib/auth/nextTarget'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ allowed: false })
  }

  const host = req.query.host
  if (typeof host !== 'string' || !host) {
    return res.status(400).json({ allowed: false })
  }

  const allowed = await isRegisteredSiteHost(prisma, host)
  return res.status(200).json({ allowed })
}
