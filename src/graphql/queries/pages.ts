import { gql } from '@apollo/client'

import {
  PageDetailFragment,
  PageListItemFragment,
} from '~/graphql/fragments/page'

export const GET_PAGES = gql`
  query getPages($filter: PagesFilter) {
    pages(filter: $filter) {
      ...PageListItem
    }
  }
  ${PageListItemFragment}
`

export const GET_PAGE = gql`
  query getPage($slug: String!) {
    page(slug: $slug) {
      ...PageDetail
    }
  }
  ${PageDetailFragment}
`

export const GET_HOME_PAGE = gql`
  query getHomePage {
    homepage {
      ...PageDetail
    }
  }
  ${PageDetailFragment}
`
