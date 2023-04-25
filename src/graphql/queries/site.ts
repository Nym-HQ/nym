import { gql } from '@apollo/client'

import {
  SiteInfoFragment,
  SiteUserInfoFragment,
  UserSiteInfoFragment,
} from '~/graphql/fragments/site'

export const GET_USER_SITES = gql`
  query getSites {
    userSites {
      ...UserSiteInfo
    }
  }
  ${UserSiteInfoFragment}
  ${SiteInfoFragment}
`

export const GET_SITE_USERS = gql`
  query getSiteUsers {
    siteUsers {
      ...SiteUserInfo
    }
  }
  ${SiteUserInfoFragment}
`
