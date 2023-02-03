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
