import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import { getNewsletterProvider } from '~/lib/newsletter'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

/**
 * Send the newsletter
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { subject, html, text } = req.body
  if (!subject || !html || !text) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: subject, html, text',
    })
  }

  const context = await getContext({ req, res }, prisma)
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
