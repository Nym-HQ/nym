import { gql } from '@apollo/client'

export const SiteInfoFragment = gql`
  fragment SiteInfo on Site {
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
    newsletter_provider
    newsletter_description
    newsletter_double_optin
    newsletter_setting1
    newsletter_setting2
    newsletter_setting3
    social_twitter
    social_youtube
    social_github
    social_other1
    social_other1_label
  }
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
      ...SiteInfo
    }
  }
  ${SiteInfoFragment}
`
