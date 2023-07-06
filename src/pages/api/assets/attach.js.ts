import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'

export const config = {
  runtime: 'nodejs',
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const context = await getContext({ req, res })

  // remove <script> tags
  const js = (context.site?.attach_js || '').replace(
    /^(\s*<script[^>]*>)|(<\/script>\s*)$/g,
    ''
  )
  res.setHeader('Content-Type', 'application/javascript').send(js)
  res.end()
}
