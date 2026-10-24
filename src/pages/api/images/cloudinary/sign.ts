import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import { isSiteAdmin } from '~/graphql/helpers/isSiteAdmin'
import cloudinary from '~/lib/cloudinary'
import { buildCloudinarySignParams } from '~/lib/images/cloudinarySignParams'
import prisma from '~/lib/prisma'

/**
 * Get signature for uploading images to Cloudinary
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ signature: null })
  }

  const context = await getContext({ req, res }, prisma)
  if (!isSiteAdmin(context)) {
    return res.status(401).json({ signature: null })
  }

  const params = buildCloudinarySignParams({
    body: req.body || {},
    siteId: context.site?.id,
    uploadPreset: process.env.CLOUDINARY_PRESET,
  })
  if (!params) {
    return res.status(400).json({ signature: null })
  }

  const signature = await cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  )
  return res.status(200).json({ signature, params })
}
