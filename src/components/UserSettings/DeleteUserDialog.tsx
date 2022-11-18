import { useApolloClient } from '@apollo/client'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import * as React from 'react'

import { DeleteButton } from '~/components/Button'
import { DialogComponent } from '~/components/Dialog'
import { useDeleteUserMutation } from '~/graphql/types.generated'

import { LoadingSpinner } from '../LoadingSpinner'

export function DeleteUserDialog({ trigger }) {
  const router = useRouter()
  const apolloClient = useApolloClient()
  const [handleDelete, { loading }] = useDeleteUserMutation()

  return (
    <DialogComponent
      trigger={trigger}
      title={'Delete account'}
      modalContent={() => (
        <div className="text-primary flex flex-col space-y-4 p-4 text-left">
          <p>All comments, reactions, and Q&A questions will be deleted.</p>

          <DeleteButton
            onClick={async () => {
              await handleDelete()
              await signOut()
              await apolloClient.resetStore()
            }}
          >
            {loading ? <LoadingSpinner /> : 'Delete my account'}
          </DeleteButton>
        </div>
      )}
    />
  )
}
