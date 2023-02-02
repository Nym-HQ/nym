import { Site } from '@prisma/client'
import MailchimpNewsletterProvider from './providers/mailchimp'
import NewsletterProviderBase from './providers/ProviderBase'
import RevueNewsletterProvider from './providers/revue'

export function getNewsletterProvider(site: Site): NewsletterProviderBase {
  switch (site.newsletter_provider) {
    case 'mailchimp':
      return new MailchimpNewsletterProvider(site.newsletter_setting1)
    case 'revue':
      return new RevueNewsletterProvider(site.newsletter_setting1)
  }
  return null
}
