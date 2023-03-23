import { gql } from '@apollo/client'

import {
  UserInfoFragment,
  UserSettingsFragment,
} from '~/graphql/fragments/user'

import { SiteInfoFragment, UserSiteFragment } from '../fragments/site'

export const GET_VIEWER_SETTINGS = gql`
  query getViewerWithSettings {
    context {
      viewer {
        ...UserInfo
        ...UserSettings
      }
    }
  }
  ${UserInfoFragment}
  ${UserSettingsFragment}
`

export const GET_CONTEXT = gql`
  query context {
    context {
      viewer {
        ...UserInfo
      }
      site {
        ...SiteInfo
      }
      userSite {
        ...UserSite
      }
      owner {
        image
        avatar
        hasEmail
      }
    }
  }
  ${UserInfoFragment}
  ${SiteInfoFragment}
  ${UserSiteFragment}
`
