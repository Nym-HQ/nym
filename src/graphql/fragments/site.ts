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
    mailgun_region
    mailgun_domain
    mailgun_api_key
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
