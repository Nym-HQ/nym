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
      logo
      banner
      attach_css
      attach_js
      newsletter_provider
      newsletter_description
      newsletter_from_email
      newsletter_double_optin
      newsletter_setting1
      newsletter_setting2
      newsletter_setting3
      social_github
      social_twitter
      social_youtube
      social_other1
      social_other1_label
      community_site
      chatbot {
        id
        openai_key
        prompt_template
        free_quota
      }
    }
  }
`
