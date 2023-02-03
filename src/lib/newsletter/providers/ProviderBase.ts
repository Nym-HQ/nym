interface NewsletterProviderBase {
  /**
   * Add a new subscriber
   * @param param0
   * @returns
   */
  addSubscriber: ({ email }) => Promise<any>

  /**
   * Remove a subscriber
   * @param param0
   * @returns
   */
  removeSubscriber: ({ email }) => Promise<any>

  /**
   * Send an email with the given subject and body
   *
   * @param param0
   * @returns
   */
  send: ({ subject, htmlBody, textBody }) => Promise<any>

  /**
   * Send an email with the given template
   * @param param0
   * @returns
   */
  sendWithTemplate: ({ templateId, templateModel }) => Promise<any>

  getSubscribers: () => Promise<any>
  getSubscriber: ({ email }) => Promise<any>

  getTemplates: () => Promise<any>
  addTemplate: ({ subject, body }) => Promise<any>
  editTemplate: ({ templateId, subject, body }) => Promise<any>
  removeTemplate: ({ templateId }) => Promise<any>
}

export default NewsletterProviderBase
