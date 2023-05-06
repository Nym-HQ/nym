import { gql } from '@apollo/client'

export const PageCoreFragment = gql`
  fragment PageCore on Page {
    __typename
    id
    publishedAt
    title
    path
    slug
    excerpt
    featured
  }
`

export const PageListItemFragment = gql`
  fragment PageListItem on Page {
    ...PageCore
  }
  ${PageCoreFragment}
`

export const PageDetailFragment = gql`
  fragment PageDetail on Page {
    ...PageCore
    text
    data
    featureImage
    access
  }
  ${PageCoreFragment}
`
