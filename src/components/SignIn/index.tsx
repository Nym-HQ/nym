import { signIn } from 'next-auth/react'
import * as React from 'react'

import { GoogleButton, TwitterButton } from '../Button'
import { GoogleIcon, TwitterIcon } from '../Icon'
import { Detail } from '../ListDetail/Detail'
import { TitleBar } from '../ListDetail/TitleBar'

export function SignIn({ children = null, trigger = null }) {
  return (
    <Detail.Container>
      <TitleBar title="Log In" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="mb-2">Please login - </p>

        <TwitterButton
          style={{ width: '190px', height: '38px' }}
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

        <GoogleButton
          style={{ width: '190px', height: '38px' }}
          size="large"
          onClick={() =>
            signIn('google', {
              callbackUrl: `/signin-complete`,
              redirect: true,
            })
          }
        >
          <GoogleIcon />
          <span>Login with Google</span>
        </GoogleButton>
      </div>
    </Detail.Container>
  )
}
