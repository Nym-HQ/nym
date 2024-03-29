import { Context } from '~/graphql/context'
import prisma from '~/lib/prisma'

import MailchimpNewsletterProvider from './providers/mailchimp'
import NewsletterProviderBase from './providers/ProviderBase'
import RevueNewsletterProvider from './providers/revue'

export async function getNewsletterProvider(
  context: Context
): Promise<NewsletterProviderBase> {
  const { site, owner } = context
  let provider: NewsletterProviderBase = null
  switch (site.newsletter_provider) {
    case 'Mailchimp':
      if (site.newsletter_setting1)
        provider = new MailchimpNewsletterProvider({
          useDoubleOptin: site.newsletter_double_optin,
          API_TOKEN: site.newsletter_setting1,
          audienceListId: site.newsletter_setting2,
        })
      break
    case 'revue':
      if (site.newsletter_setting1)
        provider = new RevueNewsletterProvider({
          useDoubleOptin: site.newsletter_double_optin,
          API_TOKEN: site.newsletter_setting1,
        })
      break
  }

  if (provider === null) return

  const afterInit = await provider.init({
    fromName: site?.name,
    fromEmail: site?.newsletter_from_email || owner?.email,
  })

  if (
    site.newsletter_provider === 'Mailchimp' &&
    afterInit &&
    afterInit.listId &&
    !site.newsletter_setting2
  ) {
    // update site's newsletter_setting2
    await prisma.site.update({
      where: {
        id: site.id,
      },
      data: {
        newsletter_setting2: afterInit.listId,
      },
    })
    site.newsletter_setting2 = afterInit.listId
  }

  return provider
}
