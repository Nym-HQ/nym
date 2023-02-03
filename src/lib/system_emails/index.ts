import * as postmark from 'postmark'

import { baseEmail } from '~/config/seo'
import { IS_PROD } from '~/graphql/constants'

export const client = process.env.POSTMARK_CLIENT_ID
  ? new postmark.ServerClient(process.env.POSTMARK_CLIENT_ID)
  : {
      sendEmail: () => {},
      sendEmailWithTemplate: () => {},
    }

interface EmailMeProps {
  subject: string
  body: string
}

export function emailMe({ subject, body }: EmailMeProps) {
  if (!IS_PROD) {
    return console.log('Sending Postmark email: ', {
      From: baseEmail,
      To: baseEmail,
      Subject: subject,
      TextBody: body,
    })
  }

  return client.sendEmail({
    From: baseEmail,
    To: baseEmail,
    Subject: subject,
    TextBody: body,
  })
}

export function sendEmailWithTemplate({ email, templateId, url }: any) {
  client.sendEmailWithTemplate({
    From: baseEmail,
    To: email,
    TemplateId: templateId,
    TemplateModel: { url },
  })
}
