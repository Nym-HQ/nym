import * as React from 'react'
import toast from 'react-hot-toast'

import { ErrorAlert, SuccessAlert } from '~/components/Alert'
import { PrimaryButton } from '~/components/Button'
import { Input } from '~/components/Input'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import {
  EmailSubscriptionType,
  useEditEmailSubscriptionMutation,
} from '~/graphql/types.generated'
import { validEmail } from '~/lib/validators'

export function WritingSubscriptionForm({
  defaultValue = '',
  doubleOptin = false,
}) {
  const [email, setEmail] = React.useState(defaultValue)
  const [status, setStatus] = React.useState('default')
  const [editEmailSubscription] = useEditEmailSubscriptionMutation({
    onCompleted() {
      toast.success('Subscribed!')
    },
  })

  function onChange(e) {
    setStatus('default')
    return setEmail(e.target.value.trim())
  }

  async function submit(e) {
    e.preventDefault()
    setStatus('saving')

    if (!validEmail(email)) {
      return setStatus('invalid-email')
    }

    await editEmailSubscription({
      variables: {
        data: {
          email: email,
          type: EmailSubscriptionType.Newsletter,
          subscribed: true,
        },
      },
    })

    setStatus('success')
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col space-y-4">
        <form
          data-cy="subscribe-hn-form"
          onSubmit={submit}
          className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3"
        >
          <label className="md:col-span-2">
            <span className="sr-only">Email address</span>
            <Input
              value={email}
              disabled={status === 'loading'}
              onChange={onChange}
              placeholder="Email address"
              type="email"
              name="email"
            />
          </label>
          <PrimaryButton
            onClick={submit}
            disabled={status === 'saving' || !email}
            type="submit"
          >
            {status === 'saving' ? <LoadingSpinner /> : 'Subscribe'}
          </PrimaryButton>
        </form>
        <p className="text-quaternary text-sm">Unsubscribe at any time.</p>
        {status === 'invalid-email' && (
          <ErrorAlert>That email doesn’t look valid, try another?</ErrorAlert>
        )}
        {status === 'success' && doubleOptin && (
          <SuccessAlert>
            A confirmation email was sent to {email} — go click the link!
          </SuccessAlert>
        )}
        {status === 'success' && !doubleOptin && (
          <SuccessAlert>
            Thank you for subscribing to the newsletter!
          </SuccessAlert>
        )}
      </div>
    </div>
  )
}
