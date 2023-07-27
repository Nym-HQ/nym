import { gql } from '@apollo/client'

import { UserApiKeyFragment, UserInfoFragment } from '~/graphql/fragments/user'

export const DELETE_USER = gql`
  mutation deleteUser {
    deleteUser
  }
`

export const EDIT_USER = gql`
  mutation editUser($data: EditUserInput) {
    editUser(data: $data) {
      ...UserInfo
    }
  }
  ${UserInfoFragment}
`

export const SET_USER_API_KEY = gql`
  mutation setUserApiKey($data: SetUserApiKeyInput) {
    setUserApiKey(data: $data) {
      ...UserApiKey
    }
  }
  ${UserApiKeyFragment}
`
