import { signIn } from 'next-auth/react'
import * as React from 'react'

import { TwitterButton } from '../Button'
import { TwitterIcon } from '../Icon'
import { Detail } from '../ListDetail/Detail'
import { TitleBar } from '../ListDetail/TitleBar'

export function SignIn({ children = null, trigger = null }) {
  return (
    <Detail.Container>
      <TitleBar title="Sign In" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>Please signin - </p>

        <TwitterButton
          onClick={() =>
            signIn('twitter', {
              callbackUrl: `/signin-complete`,
              redirect: true,
            })
          }
        >
          <TwitterIcon />
          <span>Sign in with Twitter</span>
        </TwitterButton>
      </div>
    </Detail.Container>
  )
}
