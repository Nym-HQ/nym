import { gql } from '@apollo/client'

import {
  UserInfoFragment,
  UserSettingsFragment,
} from '~/graphql/fragments/user'

import { SitePublicInfoFragment, UserSiteFragment } from '../fragments/site'

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
        ...SitePublicInfo
      }
      userSite {
        ...UserSite
      }
      owner {
        image
        avatar
        hasEmail
        name
      }
    }
  }
  ${UserInfoFragment}
  ${SitePublicInfoFragment}
  ${UserSiteFragment}
`
