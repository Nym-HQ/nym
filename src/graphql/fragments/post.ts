import { gql } from '@apollo/client'

import { UserInfoFragment } from './user'

export const PostCoreFragment = gql`
  fragment PostCore on Post {
    __typename
    id
    publishedAt
    title
    slug
    excerpt
    author {
      ...UserInfo
    }
  }
  ${UserInfoFragment}
`

export const PostListItemFragment = gql`
  fragment PostListItem on Post {
    ...PostCore
  }
  ${PostCoreFragment}
`

export const PostDetailFragment = gql`
  fragment PostDetail on Post {
    ...PostCore
    text
    data
    featureImage
    reactionCount
    viewerHasReacted
    newsletterAt
    access
  }
  ${PostCoreFragment}
`
