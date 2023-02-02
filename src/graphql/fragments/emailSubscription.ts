import { gql } from '@apollo/client'

export const EmailSubscriptionDetailFragment = gql`
  fragment EmailSubscriptionDetail on EmailSubscription {
    __typename
    email
    type
    userId
  }
`

export const EmailSubscriptionListItemFragment = gql`
  fragment EmailSubscriptionListItem on EmailSubscription {
    ...EmailSubscriptionDetail
  }
  ${EmailSubscriptionDetailFragment}
`

export const EmailSubscriptionsConnectionFragment = gql`
fragment EmailSubscriptionsConnection on EmailSubscriptionsConnection {
  pageInfo {
    hasNextPage
    totalCount
    endCursor
  }
  edges {
    cursor
    node {
      ...EmailSubscriptionListItem
    }
  }
}
${EmailSubscriptionListItemFragment}
`