import mailchimp from '@mailchimp/mailchimp_marketing'

import { IS_PROD } from '~/graphql/constants'

import NewsletterProviderBase from './ProviderBase'

export default class MailchimpNewsletterProvider
  implements NewsletterProviderBase
{
  // parameters
  private apiKey: string
  private instanceId: string
  private audienceListId: string = null
  private useDoubleOptin: boolean = true
  private lastError = null

  // constants
  private headers = {
    Authorization: `Token `,
  }
  private baseUrl: string
  private fromName: string
  private fromEmail: string

  constructor({
    useDoubleOptin,
    API_TOKEN,
    audienceListId,
  }: {
    useDoubleOptin?: boolean
    API_TOKEN: string
    audienceListId?: string
  }) {
    this.useDoubleOptin =
      typeof useDoubleOptin === 'undefined' || useDoubleOptin === null
        ? true
        : useDoubleOptin
    this.apiKey = API_TOKEN
    this.instanceId = API_TOKEN.slice(API_TOKEN.indexOf('-') + 1)
    if (audienceListId) this.audienceListId = audienceListId

    if (!IS_PROD) {
      console.log(
        'Mailchimp Newsletter Provider class is initialized for ',
        this.instanceId,
        this.audienceListId
      )
    }

    // initialize the constants based on parameters
    this.headers.Authorization = `Basic ${Buffer.from(
      'any:' + this.apiKey
    ).toString('base64')}`
    this.baseUrl = `https://${this.instanceId}.api.mailchimp.com`
  }

  async init({ fromEmail, fromName }) {
    this.fromEmail = fromEmail
    this.fromName = fromName

    if (!this.audienceListId) {
      // try to create a default audience list
      mailchimp.setConfig({
        apiKey: this.apiKey,
        server: this.instanceId,
      })

      const mailchimpUntyped = mailchimp as any
      if (
        mailchimpUntyped.lists &&
        typeof mailchimpUntyped.lists.getAllLists === 'function'
      ) {
        const response = await mailchimpUntyped.lists.getAllLists()
        this.audienceListId = response.lists[0].id
        console.log('Got the default audience list id: ', this.audienceListId)
      }
    }
    return {
      instanceId: this.instanceId,
      listId: this.audienceListId,
    }
  }

  /**
   * Add a new subscriber
   * @param param0
   * @returns
   */
  async addSubscriber({ email }) {
    if (!this.audienceListId) {
      return false
    }
    try {
      mailchimp.setConfig({
        apiKey: this.apiKey,
        server: this.instanceId,
      })
      const response = await mailchimp.lists.addListMember(
        this.audienceListId,
        {
          email_address: email,
          status: this.useDoubleOptin ? 'pending' : 'subscribed',
          merge_fields: {},
          tags: ['nym'],
        }
      )
      if (
        +response.status < 300 ||
        (response.status === 400 && (response as any).title === 'Member Exists')
      ) {
        // success
        return true
      } else {
        throw new Error('Failed to subscribe')
      }
    } catch (e) {
      console.error({ e })
      return false
    }
  }

  /**
   * Remove a subscriber
   * @param param0
   * @returns
   */
  async removeSubscriber({ email, doubleOptIn }) {
    try {
      mailchimp.setConfig({
        apiKey: this.apiKey,
        server: this.instanceId,
      })
      const response = await mailchimp.lists.addListMember(
        this.audienceListId,
        {
          email_address: email,
          status: 'unsubscribed',
          merge_fields: {},
          tags: ['nym'],
        }
      )
      if (
        +response.status < 300 ||
        (response.status === 400 && (response as any).title === 'Member Exists')
      ) {
        // success
        return true
      } else {
        this.lastError = response
        return false
      }
    } catch (e) {
      console.error(
        'Unexpected exception occured while adding a new member to a list',
        e
      )
      this.lastError = e
      return false
    }
  }

  /**
   * Send a newsletter with a subject and body
   *
   */
  async send({
    subject,
    htmlBody,
    textBody,
  }: {
    subject: any
    htmlBody: any
    textBody: any
  }): Promise<any> {
    try {
      mailchimp.setConfig({
        apiKey: this.apiKey,
        server: this.instanceId,
      })
      const mailchimpUntyped = mailchimp as any
      if (
        mailchimpUntyped.templates &&
        typeof mailchimpUntyped.templates.create === 'function'
      ) {
        console.log('Creating a new newletter template')
        const templateCreated = await mailchimpUntyped.templates.create({
          name: `${new Date().toDateString()} - ${subject}`.slice(0, 50), // name requires to be max 50 characters
          html: htmlBody,
        })
        if (templateCreated.id) {
          const templateId = templateCreated.id
          return await this.sendWithTemplate({
            templateId,
            templateModel: {},
            subject,
          })
        } else {
          console.log('Failed to create a template', templateCreated)
          return false
        }
      }
    } catch (e) {
      console.error({ e })
      return null
    }
  }

  /**
   * Send a newsletter with a template
   *
   * @param param0
   */
  async sendWithTemplate({ templateId, templateModel, subject }): Promise<any> {
    mailchimp.setConfig({
      apiKey: this.apiKey,
      server: this.instanceId,
    })
    const mailchimpUntyped = mailchimp as any

    // first create a campaign
    const campaignResponse = await mailchimpUntyped.campaigns.create({
      type: 'regular',
      recipients: {
        list_id: this.audienceListId,
      },
      settings: {
        title: `${subject} - ${new Date().toDateString()}`,
        template_id: templateId,
        subject_line: subject,
        reply_to: this.fromEmail,
        from_name: this.fromName,
        auto_footer: true,
      },
    })

    // failed to create a campaign?
    if (!campaignResponse.id) {
      console.error('Failed to create campaign', campaignResponse)
      this.lastError = campaignResponse
      return false
    } else {
      console.info('Mailchimp campaign created', campaignResponse)
    }

    // successfully created a campagin, let's send it out
    let sendResponse
    if (IS_PROD) {
      sendResponse = await mailchimpUntyped.campaigns.send(campaignResponse.id)
    } else {
      sendResponse = await mailchimpUntyped.campaigns.sendTestEmail(
        campaignResponse.id,
        {
          test_emails: ['klokt.valg@gmail.com'],
          send_type: 'html',
        }
      )
    }

    if (!sendResponse || (sendResponse && sendResponse.status < 300)) {
      // success
      return true
    } else {
      this.lastError = sendResponse
      console.error('Failed to send the campaign', sendResponse)
      return false
    }
  }

  async getSubscribers() {
    throw new Error('Method not implemented.')
  }

  async getTemplates(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async addTemplate({
    subject,
    body,
  }: {
    subject: any
    body: any
  }): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async editTemplate({
    templateId,
    subject,
    body,
  }: {
    templateId: any
    subject: any
    body: any
  }): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async removeTemplate({ templateId }: { templateId: any }): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async getSubscriber({ email }) {
    throw new Error('Method not implemented.')
  }
}
