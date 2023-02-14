import { Site } from '@prisma/client'
import * as postmark from 'postmark'

import { baseEmail } from '~/config/seo'
import { User } from '~/graphql/types.generated'

import { getSiteDomain } from '../multitenancy/client'
import { validEmail } from '../validators'

export const client = process.env.POSTMARK_CLIENT_ID
  ? new postmark.ServerClient(process.env.POSTMARK_CLIENT_ID)
  : {
      sendEmail: () => {},
      sendEmailWithTemplate: () => {},
    }

interface EmailToSiteOwnerProps {
  site: Site
  owner: User | null
  subject: string
  body: string
}

export function emailToSiteOwner({
  subject,
  body,
  site,
  owner,
}: EmailToSiteOwnerProps) {
  if (validEmail(owner.email)) {
    return client.sendEmail({
      From: baseEmail,
      To: owner.email,
      Subject: subject,
      TextBody: body,
    })
  } else {
    console.log(
      'Site owner does not have the email configured. Skipping email.'
    )
    return true
  }
}

export function sendEmailWithTemplate({ email, templateId, url }: any) {
  return client.sendEmailWithTemplate({
    From: baseEmail,
    To: email,
    TemplateId: templateId,
    TemplateModel: { url },
  })
}

/**
 * Send out email to confirm email address change
 *
 * @param site
 * @param user
 * @param data
 * @returns
 */
const confirmChangedEmailAddress = async (
  site: Site,
  user: User,
  data: { email: string; token: string }
) => {
  console.log('Sending confirmation email to the user: ', user.username)
  const { email, token } = data

  try {
    const url = `https://${getSiteDomain(
      site
    )}/api/email/confirm?token=${token}`

    let sent
    if (process.env.SYSTEM_EMAIL_TEMPLATE_ID_CONFIRM_CHANGED_EMAIL_ADDRESS) {
      sent = await client.sendEmailWithTemplate({
        From: baseEmail,
        To: email,
        TemplateId: Number.parseInt(
          process.env.SYSTEM_EMAIL_TEMPLATE_ID_CONFIRM_CHANGED_EMAIL_ADDRESS
        ),
        TemplateModel: { url },
      })
    } else {
      sent = await client.sendEmail({
        From: baseEmail,
        To: email,
        Subject: 'Please confirm your new email address!',
        HtmlBody: `<p>Please confirm your new email address by clicking <a href='${encodeURI(
          url
        )}'>here</a></p>`,
      })
    }
    console.log('Sent "confirm-changed-email-address" email: ', sent)
    return true
  } catch (err) {
    console.log('Failed to send "confirm-changed-email-address" email: ', err)
    return false
  }
}

export const predefinedEmails = {
  confirmChangedEmailAddress,
}
