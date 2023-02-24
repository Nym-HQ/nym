import { NextApiRequest, NextApiResponse } from 'next'

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

  if (url.startsWith('https://twitter.com/')) {
    const resp = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURI(url)}`
    )
    const json = await resp.json()
    return res.status(200).json({
      success: 1,
      meta: json,
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
      meta: {
        title: json?.title,
        description: json?.description,
        image: {
          url: json?.thumbnail_url,
        },
      },
    })
  }

  return res.status(400).json({
    success: 0,
    error: 'Could not get the meta-data of the URL',
  })
}
