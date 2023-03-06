import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const context = await getContext({ req, res })
  res
    .setHeader('Content-Type', 'application/javascript')
    .send(context.site?.attach_js || '')
  res.end()
}
