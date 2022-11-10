import { gql } from '@apollo/client'

import {
  UserInfoFragment,
  UserSettingsFragment,
  ViewerInfoFragment,
} from '~/graphql/fragments/user'

export const GET_VIEWER = gql`
  query viewer {
    viewer {
      ...UserInfo
      ...ViewerInfo
    }
  }
  ${UserInfoFragment}
  ${ViewerInfoFragment}
`

export const GET_VIEWER_SETTINGS = gql`
  query getViewerWithSettings {
    viewer {
      ...UserInfo
      ...ViewerInfo
      ...UserSettings
    }
  }
  ${UserInfoFragment}
  ${ViewerInfoFragment}
  ${UserSettingsFragment}
`
