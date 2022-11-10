import { gql } from '@apollo/client'

export const UserInfoFragment = gql`
  fragment UserInfo on User {
    __typename
    id
    username
    avatar
    name
    role
    isViewer
    isAdmin
  }
`

export const UserSettingsFragment = gql`
  fragment UserSettings on User {
    email
    pendingEmail
    emailSubscriptions {
      type
      subscribed
    }
  }
`

export const ViewerInfoFragment = gql`
  fragment ViewerInfo on User {
    isViewer
    isViewerSiteAdmin
    viewerSite {
      id
      subdomain
      parkedDomain
    }
    viewerUserSite {
      siteRole
    }
    isAdmin
  }
`
