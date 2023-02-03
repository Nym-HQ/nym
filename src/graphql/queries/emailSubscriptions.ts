import { gql } from '@apollo/client'

import { EmailSubscriptionsConnectionFragment } from '../fragments/emailSubscription'

export const GET_EMAIL_SUBSCRIPTIONS = gql`
  query getEmailSubscriptions($first: Int, $after: String) {
    emailSubscriptions(first: $first, after: $after) {
      ...EmailSubscriptionsConnection
    }
  }
  ${EmailSubscriptionsConnectionFragment}
`
