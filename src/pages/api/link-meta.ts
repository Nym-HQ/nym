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
  } else if (url.match(/https:\/\/www.tiktok.com\/@(.*)\/video\/(.*)/)) {
    const matches = url.match(/https:\/\/www.tiktok.com\/@(.*)\/video\/(.*)/)
    const username = matches[1]
    const videoId = matches[2]
    const html = `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@${username}/video/${videoId}" data-video-id="${videoId}" data-embed-from="embed_page" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@${username}" href="https://www.tiktok.com/@${username}?refer=embed">@${username}</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>`
    return res.status(200).json({
      success: 1,
      link: url,
      meta: {
        html,
        provider_name: 'Tiktok',
        url,
        author: username,
        author_url: `https://www.tiktok.com/@${username}`,
      },
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
