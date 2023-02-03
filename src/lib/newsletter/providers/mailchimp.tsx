import { IS_PROD } from '~/graphql/constants'
import { useLocalFiles } from '~/graphql/helpers/useLocalFiles'

import NewsletterProviderBase from './ProviderBase'

const MAILCHIMP_BASE_URL = 'https://www.getMailchimp.co/api/v2'

interface AddItemToIssueProps {
  id: string
  url: string
}

export default class MailchimpNewsletterProvider
  implements NewsletterProviderBase
{
  private headers = {
    Authorization: `Token `,
  }

  constructor(API_TOKEN: string) {
    this.headers.Authorization = `Token ${API_TOKEN}`
  }

  /**
   * Add a new subscriber
   * @param param0
   * @returns
   */
  async addSubscriber({ email, doubleOptIn }) {
    try {
      const result = await fetch(`${MAILCHIMP_BASE_URL}/subscribers`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, double_opt_in: doubleOptIn }),
      })
      const data = await result.json()
      return data
    } catch (e) {
      console.error({ e })
      return null
    }
  }

  /**
   * Remove a subscriber
   * @param param0
   * @returns
   */
  async removeSubscriber({ email, doubleOptIn }) {
    try {
      const result = await fetch(
        `${MAILCHIMP_BASE_URL}/subscribers/unsubscribe`,
        {
          method: 'POST',
          headers: {
            ...this.headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, double_opt_in: doubleOptIn }),
        }
      )
      const data = await result.json()
      return data
    } catch (e) {
      console.error({ e })
      return null
    }
  }

  /**
   * Send a newsletter with a subject and body
   *
   */
  send: ({
    subject,
    htmlBody,
    textBody,
  }: {
    subject: any
    htmlBody: any
    textBody: any
  }) => Promise<any>

  /**
   * Send a newsletter with a template
   *
   * @param param0
   */
  sendWithTemplate({
    templateId,
    templateModel,
  }: {
    templateId: any
    templateModel: any
  }): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async getSubscribers() {
    const res = await fetch(`${MAILCHIMP_BASE_URL}/subscribers`, {
      method: 'GET',
      headers: this.headers,
    })

    return await res.json()
  }

  getTemplates: () => Promise<any>
  addTemplate: ({ subject, body }: { subject: any; body: any }) => Promise<any>
  editTemplate: ({
    templateId,
    subject,
    body,
  }: {
    templateId: any
    subject: any
    body: any
  }) => Promise<any>
  removeTemplate: ({ templateId }: { templateId: any }) => Promise<any>

  async getSubscriber({ email }) {
    try {
      if (IS_PROD) {
        const subscribers = await this.getSubscribers()
        return subscribers.find((sub) => sub.email === email)
      } else {
        const subscribers = await useLocalFiles({
          path: 'MailchimpSubscribers',
          fetch: this.getSubscribers,
        })
        return subscribers.find((sub) => sub.email === email)
      }
    } catch (e) {
      console.error({ e })
      return null
    }
  }
}
