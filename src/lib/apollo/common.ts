import { ApolloClient } from '@apollo/client'

import { GET_PAGES } from '~/graphql/queries/pages'
import { GET_CONTEXT } from '~/graphql/queries/viewer'

export function getCommonQueries(apolloClient: ApolloClient<any>) {
  return [
    apolloClient.query({ query: GET_CONTEXT }),
    apolloClient.query({
      query: GET_PAGES,
      variables: {
        filter: { published: true, featuredOnly: true },
      },
    }),
  ]
}
