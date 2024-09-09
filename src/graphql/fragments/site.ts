import { gql } from '@apollo/client'

import { UserInfoFragment } from './user'

export const SitePublicInfoFragment = gql`
  fragment SitePublicInfo on Site {
    __typename
    id
    subdomain
    parkedDomain
    plan
    name
    description
    logo
    banner
    attach_css
    attach_js
    social_twitter
    social_youtube
    social_github
    social_other1
    social_other1_label
    newsletter_description
    newsletter_double_optin
  }
`

export const SiteChatBotFragment = gql`
  fragment SiteChatBotInfo on SiteChatBot {
    __typename
    id
    openai_key
    prompt_template
    free_quota
  }
`
 
export const SiteEditInfoFragment = gql`
  fragment SiteEditInfo on Site {
    ...SitePublicInfo

    newsletter_provider
    newsletter_from_email
    newsletter_setting1
    newsletter_setting2
    newsletter_setting3
    community_site
    chatbot {
      ...SiteChatBotInfo
    }
  }
  ${SitePublicInfoFragment}
  ${SiteChatBotFragment}
`

export const UserSiteFragment = gql`
  fragment UserSite on UserSite {
    id
    userId
    siteRole
    site {
      id
    }
  }
`

export const UserSiteInfoFragment = gql`
  fragment UserSiteInfo on UserSite {
    id
    userId
    siteRole
    site {
      ...SitePublicInfo
    }
  }
  ${SitePublicInfoFragment}
`

export const SiteUserInfoFragment = gql`
  fragment SiteUserInfo on SiteUser {
    id
    user {
      ...UserInfo
    }
    siteRole
    siteId
  }
  ${UserInfoFragment}
`
