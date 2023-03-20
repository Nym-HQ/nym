import { gql } from '@apollo/client'

export const BookmarkCoreFragment = gql`
  fragment BookmarkCore on Bookmark {
    __typename
    id
    url
    host
    title
    faviconUrl
    createdAt
    updatedAt
  }
`

export const BookmarkListItemFragment = gql`
  fragment BookmarkListItem on Bookmark {
    ...BookmarkCore
  }
  ${BookmarkCoreFragment}
`

export const BookmarkDetailFragment = gql`
  fragment BookmarkDetail on Bookmark {
    ...BookmarkCore
    description
    html
    reactionCount
    viewerHasReacted
    tags {
      name
    }
  }
  ${BookmarkCoreFragment}
`

export const BookmarksConnectionFragment = gql`
  fragment BookmarksConnection on BookmarksConnection {
    pageInfo {
      hasNextPage
      totalCount
      endCursor
    }
    edges {
      cursor
      node {
        ...BookmarkListItem
      }
    }
  }
  ${BookmarkListItemFragment}
`
