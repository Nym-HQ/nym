import { gql } from '@apollo/client'

import { SiteEditInfoFragment } from '~/graphql/fragments/site'

export const EDIT_SITE_DOMAIN = gql`
  mutation editSiteDomain($subdomain: String!, $data: EditSiteDomainInput!) {
    editSiteDomain(subdomain: $subdomain, data: $data) {
      ...SiteEditInfo
    }
  }
  ${SiteEditInfoFragment}
`

export const EDIT_SITE = gql`
  mutation editSite(
    $subdomain: String!
    $data: EditSiteInput!
    $chatbot: EditSiteChatBotInput
  ) {
    editSite(subdomain: $subdomain, data: $data, chatbot: $chatbot) {
      ...SiteEditInfo
    }
  }
  ${SiteEditInfoFragment}
`

export const DELETE_SITE = gql`
  mutation deleteSite($subdomain: String!) {
    deleteSite(subdomain: $subdomain)
  }
`

export const ADD_SITE = gql`
  mutation addSite($data: AddSiteInput!) {
    addSite(data: $data) {
      ...SiteEditInfo
    }
  }
  ${SiteEditInfoFragment}
`

export const EDIT_SITE_USER = gql`
  mutation editSiteUser($data: EditSiteUserInput!) {
    editSiteUser(data: $data) {
      siteRole
    }
  }
`
