import { gql } from '@apollo/client'

import {
  SiteInfoFragment,
  UserSiteInfoFragment,
} from '~/graphql/fragments/site'

export const GET_VIEW_SITE = gql`
  query viewSite {
    viewSite {
      ...SiteInfo
    }
  }
  ${SiteInfoFragment}
`

export const GET_USER_SITES = gql`
  query getSites {
    userSites {
      ...UserSiteInfo
    }
  }
  ${UserSiteInfoFragment}
  ${SiteInfoFragment}
`
