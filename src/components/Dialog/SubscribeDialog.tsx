import React from 'react'

import { useContextQuery } from '~/graphql/types.generated'

import { GlobalNavigationContext } from '../Providers/GlobalNavigation'
import { WritingSubscriptionForm } from '../Writing/SubscriptionForm'
import DialogComponent from './Dialog'

export default function SubscribeDialog() {
  const { isSubscribeFormOpen, setSubscribeFormOpen } = React.useContext(
    GlobalNavigationContext
  )
  const { data } = useContextQuery()

  return (
    <DialogComponent
      title="Subscribe"
      isOpen={isSubscribeFormOpen}
      onClose={() => setSubscribeFormOpen(false)}
      modalContent={() => (
        <WritingSubscriptionForm
          doubleOptin={data?.context?.site?.newsletter_double_optin}
        />
      )}
    />
  )
}
