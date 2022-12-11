import { NextApiRequest, NextApiResponse } from 'next'

import cloudinary from '~/lib/cloudinary'

/**
 * Get signature for uploading images to Cloudinary
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const signature = await cloudinary.utils.api_sign_request(req.body, process.env.CLOUDINARY_API_SECRET)
  return res.status(200).json({
    signature
  })
}