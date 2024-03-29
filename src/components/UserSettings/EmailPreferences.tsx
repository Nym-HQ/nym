import * as React from 'react'
import toast from 'react-hot-toast'

import {
  EmailSubscriptionType,
  GetViewerWithSettingsQuery,
  useEditEmailSubscriptionMutation,
  UserEmailSubscription,
} from '~/graphql/types.generated'

import { WritingSubscriptionForm } from '../Writing/SubscriptionForm'

interface Props {
  subscription: UserEmailSubscription
  newsletterDescription?: string
}

export function EmailSubscriptionForm({
  subscription,
  newsletterDescription,
}: Props) {
  const [subscribed, setSubscribed] = React.useState(subscription.subscribed)
  const [editEmailSubscription] = useEditEmailSubscriptionMutation({
    onCompleted() {
      toast.success('Saved your subscription preference!')
    },
  })

  function onChange() {
    setSubscribed((state) => {
      editEmailSubscription({
        variables: {
          data: {
            type: subscription.type,
            subscribed: !state,
          },
        },
      })

      return !state
    })
  }

  function getTitleSubtitle(type) {
    switch (type) {
      case EmailSubscriptionType.Newsletter: {
        return {
          title: 'Newsletter',
          subtitle: newsletterDescription || 'A curated newsletter.',
        }
      }
      default: {
        return {
          title: null,
          subtitle: null,
        }
      }
    }
  }

  const { title, subtitle } = getTitleSubtitle(subscription.type)

  return (
    <label className="flex items-start space-x-3">
      <input
        type="checkbox"
        onChange={onChange}
        defaultChecked={subscribed}
        className="relative top-1 h-4 w-4 rounded border border-gray-300 dark:border-gray-700"
      />
      <div className="flex flex-col">
        <p className="text-primary font-medium">{title}</p>
        <p className="text-tertiary">{subtitle}</p>
      </div>
    </label>
  )
}

export function EmailPreferences(props: {
  viewer: GetViewerWithSettingsQuery['context']['viewer']
  newsletterDescription?: string
  doubleOptin?: boolean
}) {
  const { viewer, newsletterDescription, doubleOptin } = props

  return (
    <div className="flex flex-col space-y-8">
      {viewer.emailSubscriptions?.map((subscription) => (
        <EmailSubscriptionForm
          key={subscription.type}
          subscription={subscription}
          newsletterDescription={newsletterDescription}
        />
      ))}
      <div className="pl-3">
        <WritingSubscriptionForm
          defaultValue={viewer.email}
          doubleOptin={doubleOptin}
        />
      </div>
    </div>
  )
}
