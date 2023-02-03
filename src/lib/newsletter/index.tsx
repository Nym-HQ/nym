import { Site } from '@prisma/client'

import MailchimpNewsletterProvider from './providers/mailchimp'
import NewsletterProviderBase from './providers/ProviderBase'
import RevueNewsletterProvider from './providers/revue'

export function getNewsletterProvider(site: Site): NewsletterProviderBase {
  switch (site.newsletter_provider) {
    case 'mailchimp':
      if (site.newsletter_setting1 === null)
        return new MailchimpNewsletterProvider(site.newsletter_setting1)
    case 'revue':
      if (site.newsletter_setting1 === null)
        return new RevueNewsletterProvider(site.newsletter_setting1)
  }
  return null
}

export const newsletterProviders = ['Mailchimp']

export const newsletterProviderDetails = {
  Mailchimp: {
    name: 'Mailchimp',
    setting1: 'API Key',
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
