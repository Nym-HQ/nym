import { gql } from '@apollo/client'

import {
  SiteEditInfoFragment,
  SitePublicInfoFragment,
  SiteUserInfoFragment,
  UserSiteInfoFragment,
} from '~/graphql/fragments/site'

export const GET_SITE_SETTINGS = gql`
  query getSiteSettings {
    siteSettings {
      ...SiteEditInfo
    }
  }
  ${SiteEditInfoFragment}
`

export const GET_USER_SITES = gql`
  query getUserSites {
    userSites {
      ...UserSiteInfo
    }
  }
  ${UserSiteInfoFragment}
  ${SitePublicInfoFragment}
`

export const GET_SITE_USERS = gql`
  query getSiteUsers {
    siteUsers {
      ...SiteUserInfo
    }
  }
  ${SiteUserInfoFragment}
`

export const EDIT_SITE = gql`
  mutation EditSite(
    $subdomain: String!
    $data: EditSiteInput!
    $chatbot: EditSiteChatBotInput
  ) {
    editSite(subdomain: $subdomain, data: $data, chatbot: $chatbot) {
      id
      name
      description
      # ... other fields ...
    }
  }
`
