import { gql } from '@apollo/client'

import { SiteInfoFragment } from '~/graphql/fragments/site'

export const EDIT_SITE_DOMAIN = gql`
  mutation editSiteDomain($subdomain: String!, $data: EditSiteDomainInput!) {
    editSiteDomain(subdomain: $subdomain, data: $data) {
      ...SiteInfo
    }
  }
  ${SiteInfoFragment}
`

export const EDIT_SITE = gql`
  mutation editSite($subdomain: String!, $data: EditSiteInput!) {
    editSite(subdomain: $subdomain, data: $data) {
      ...SiteInfo
    }
  }
  ${SiteInfoFragment}
`

export const DELETE_SITE = gql`
  mutation deleteSite($subdomain: String!) {
    deleteSite(subdomain: $subdomain)
  }
`

export const ADD_SITE = gql`
  mutation addSite($data: AddSiteInput!) {
    addSite(data: $data) {
      ...SiteInfo
    }
  }
  ${SiteInfoFragment}
`
