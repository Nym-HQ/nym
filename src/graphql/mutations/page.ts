import { gql } from '@apollo/client'

import { PageDetailFragment } from '~/graphql/fragments/page'

export const EDIT_PAGE = gql`
  mutation editPage($id: ID!, $data: EditPageInput!) {
    editPage(id: $id, data: $data) {
      ...PageDetail
    }
  }
  ${PageDetailFragment}
`

export const DELETE_PAGE = gql`
  mutation deletePage($id: ID!) {
    deletePage(id: $id)
  }
`

export const ADD_PAGE = gql`
  mutation addPage($data: AddPageInput!) {
    addPage(data: $data) {
      ...PageDetail
    }
  }
  ${PageDetailFragment}
`
