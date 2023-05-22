import { signIn } from 'next-auth/react'
import * as React from 'react'

import { TwitterButton } from '../Button'
import { TwitterIcon } from '../Icon'
import { Detail } from '../ListDetail/Detail'
import { TitleBar } from '../ListDetail/TitleBar'

export function SignIn({ children = null, trigger = null }) {
  return (
    <Detail.Container>
      <TitleBar title="Log In" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="mb-2">Please login - </p>

        <TwitterButton
          size="large"
          onClick={() =>
            signIn('twitter', {
              callbackUrl: `/signin-complete`,
              redirect: true,
            })
          }
        >
          <TwitterIcon />
          <span>Login with Twitter</span>
        </TwitterButton>
      </div>
    </Detail.Container>
  )
}
