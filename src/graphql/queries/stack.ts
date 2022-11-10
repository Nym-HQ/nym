import { gql } from '@apollo/client'

import {
  StackDetailFragment,
  StacksConnectionFragment,
} from '~/graphql/fragments/stack'
import { UserInfoFragment } from '~/graphql/fragments/user'

export const GET_STACKS = gql`
  query getStacks($first: Int, $after: String) {
    stacks(first: $first, after: $after) {
      ...StacksConnection
    }
  }
  ${StacksConnectionFragment}
`

export const GET_STACK = gql`
  query getStack($slug: String!) {
    stack(slug: $slug) {
      ...StackDetail
    }
  }
  ${StackDetailFragment}
  ${UserInfoFragment}
`
