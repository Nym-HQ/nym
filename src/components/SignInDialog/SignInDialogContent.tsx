import Router from 'next/router'
import * as React from 'react'

import { PrimaryButton } from '~/components/Button'
import { MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

import {
  AMAIcon,
  HackerNewsIcon,
  HeartFillIcon,
  MoreIcon,
  TwitterIcon,
} from '../Icon'

export function SignInDialogContent() {
  const getSignInUrl = () => {
    const url = new URL(window.location.href)
    if (url.host != MAIN_APP_DOMAIN) {
      return `http://${MAIN_APP_DOMAIN}/signin?redirect=true&next=${encodeURIComponent(
        window.location.href
      )}`
    } else if (url.pathname != '/signin') {
      return `/signin?redirect=true&next=${encodeURIComponent(
        window.location.href
      )}`
    } else {
      return window.location.href
    }
  }

  return (
    <div
      data-cy="sign-in-dialog"
      className="flex flex-col items-start space-y-6 p-4 md:p-6"
    >
      <div className="text-primary grid w-full gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-700 dark:bg-opacity-70">
          <AMAIcon />
          <p className="text-primary text-base font-semibold">
            Ask a Question
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-700 dark:bg-opacity-70">
          <HackerNewsIcon />
          <p className="text-primary text-base font-semibold">
            Comment on posts
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-700 dark:bg-opacity-70">
          <HeartFillIcon />
          <p className="text-primary text-base font-semibold">
            Like and save links
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-700 dark:bg-opacity-70">
          <MoreIcon />
          <p className="text-primary text-base font-semibold">More soon...</p>
        </div>
      </div>

      <div className="flex items-stretch justify-items-stretch self-stretch">
        <PrimaryButton
          onClick={() => Router.push(getSignInUrl())}
          style={{ flex: '1' }}
          size="large"
        >
          <span>Sign in</span>
        </PrimaryButton>
      </div>
      <p className="text-quaternary text-left text-xs">
        Delete your account any time. I will only request access to your public
        Twitter profile information. You won’t be subscribed to anything.
      </p>
    </div>
  )
}
