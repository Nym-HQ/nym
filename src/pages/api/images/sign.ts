import fetch from 'isomorphic-unfetch'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Upload an image to the CloudFlare CDN (uses CloudFlare Images service)
 *
 * Only "Admin" role users can use this API.
 *
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  // const isAdmin = await getCommonPageProps(req).then((props) => props.user?.isAdmin)
  // if (!isAdmin) {
  //   return res.status(401).json({ uploadURL: null })
  // }

  const CLOUDFLARE_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/direct_upload`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_KEY}`,
  }

  const data = await fetch(CLOUDFLARE_URL, { method: 'POST', headers }).then(
    (res) => res.json()
  )

  const { uploadURL } = data.result

  return res.status(200).json({ uploadURL })
}
