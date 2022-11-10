import { ApolloClient } from '@apollo/client'

import { GET_PAGES } from '~/graphql/queries/pages'
import { GET_VIEW_SITE } from '~/graphql/queries/site'
import { GET_VIEWER } from '~/graphql/queries/viewer'

export function getCommonQueries(apolloClient: ApolloClient<any>) {
  return [
    apolloClient.query({ query: GET_VIEW_SITE }),
    apolloClient.query({ query: GET_VIEWER }),
    apolloClient.query({
      query: GET_PAGES,
      variables: {
        filter: { published: true, featuredOnly: true },
      },
    }),
  ]
}
