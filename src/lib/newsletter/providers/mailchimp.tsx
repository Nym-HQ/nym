import { IS_PROD } from '~/graphql/constants'
import { useLocalFiles } from '~/graphql/helpers/useLocalFiles'
import NewsletterProviderBase from './ProviderBase'

const MAILCHIMP_BASE_URL = 'https://www.getMailchimp.co/api/v2'

interface AddItemToIssueProps {
  id: string
  url: string
}

export default class MailchimpNewsletterProvider implements NewsletterProviderBase {
  private headers = {
    Authorization: `Token `,
  }

  constructor(API_TOKEN: string) {
    this.headers.Authorization = `Token ${API_TOKEN}`
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
  send: ({ templateId }: { templateId: any }) => Promise<any>

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

  async removeSubscriber({ email, doubleOptIn }) {
    try {
      const result = await fetch(`${MAILCHIMP_BASE_URL}/subscribers/unsubscribe`, {
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

  async getCurrentIssue() {
    try {
      const result = await fetch(`${MAILCHIMP_BASE_URL}/issues/current`, {
        headers: {
          ...this.headers,
        },
      })
      const data = await result.json()
      // this should return a single object, but Mailchimp returns an array containing
      // a single issue object
      return data[0]
    } catch (e) {
      console.error({ e })
      return null
    }
  }

  async addItemToIssue({ id, url }: AddItemToIssueProps) {
    try {
      const result = await fetch(`${MAILCHIMP_BASE_URL}/issues/${id}/items`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issue_id: id, url }),
      })
      const data = await result.json()
      return data
    } catch (e) {
      console.error({ e })
      return null
    }
  }
}
