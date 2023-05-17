import { NextApiRequest, NextApiResponse } from 'next'

import { getTweetCardHtml } from '~/lib/tweet/getTweetCardHtml'
import { getTwitterId } from '~/lib/tweet/parser'

/**
 * Extract Link's metadata
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { url: urlQueryParam } = req.query

  if (!urlQueryParam) {
    return res.status(400).json({
      success: 0,
      error: 'URL is required',
    })
  }
  const url =
    typeof urlQueryParam === 'string' ? urlQueryParam : urlQueryParam[0]

  if (getTwitterId(url)) {
    const { html, meta } = await getTweetCardHtml(url)
    return res.status(200).json({
      success: 1,
      link: url,
      meta: meta,
      html: html,
    })
  } else if (process.env.IFRAMELY_API_KEY) {
    const resp = await fetch(
      `https://iframe.ly/api/oembed?url=${encodeURIComponent(url)}&api_key=${
        process.env.IFRAMELY_API_KEY
      }`
    )
    const json = await resp.json()

    return res.status(200).json({
      success: 1,
      link: url,
      meta: {
        ...json,
        image: {
          url: json?.thumbnail_url,
        },
        html: json?.html?.includes('<script') ? null : json?.html,
      },
    })
  }

  return res.status(400).json({
    success: 0,
    error: 'Could not get the meta-data of the URL',
  })
}
