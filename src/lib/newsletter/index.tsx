import { Context } from '~/graphql/context'
import { prisma } from '~/lib/prisma'

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
        provider = new MailchimpNewsletterProvider(
          site.newsletter_setting1,
          site.newsletter_setting2
        )
      break
    case 'revue':
      if (site.newsletter_setting1)
        provider = new RevueNewsletterProvider(site.newsletter_setting1)
      break
  }

  if (provider != null) {
    const afterInit = await provider.init({
      fromName: site?.name,
      fromEmail: owner?.email,
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
  }

  return provider
}

export const newsletterProviders = ['Mailchimp']

export const newsletterProviderDetails = {
  Mailchimp: {
    name: 'Mailchimp',
    setting1: 'API Key (Required)',
    setting2: 'Audience List ID (Optional)',
    setting3: false,
    help_text: (
      <span>
        Mailchimp is a marketing automation platform and email marketing
        service.
        <br />
        You can create a free account <a href="https://mailchimp.com/">here</a>.
        <br />
        Also read <a href="https://mailchimp.com/help/about-api-keys/">
          this
        </a>{' '}
        to see how to get your API keys
      </span>
    ),
  },
}
