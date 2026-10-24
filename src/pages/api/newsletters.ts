import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import { isSiteAdmin } from '~/graphql/helpers/isSiteAdmin'
import { getNewsletterProvider } from '~/lib/newsletter'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

/**
 * Send the newsletter
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  const context = await getContext({ req, res }, prisma)
  if (!isSiteAdmin(context)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    })
  }

  const { subject, html, text } = req.body
  if (!subject || !html || !text) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: subject, html, text',
    })
  }

  const newsletterProvider = await getNewsletterProvider(context)

  if (newsletterProvider) {
    const sent = await newsletterProvider.send({
      subject,
      htmlBody: html,
      textBody: text,
    })
    if (sent) {
      return res.status(200).json({
        success: true,
      })
    }
  }

  return res.status(400).json({
    success: false,
    message: 'Failed to send newsletter',
  })
}
