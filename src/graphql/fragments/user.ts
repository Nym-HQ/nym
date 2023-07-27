import { gql } from '@apollo/client'

export const UserInfoFragment = gql`
  fragment UserInfo on User {
    __typename
    id
    username
    image
    avatar
    name
    role
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

export const UserApiKeyFragment = gql`
  fragment UserApiKey on User {
    api_key
  }
`
