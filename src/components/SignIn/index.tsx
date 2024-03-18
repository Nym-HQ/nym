import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import * as React from 'react'

import { Button, GoogleButton, TwitterButton } from '../Button'
import { GoogleIcon, TwitterIcon } from '../Icon'
import { Detail } from '../ListDetail/Detail'
import { TitleBar } from '../ListDetail/TitleBar'

export function SignIn({
  children = null,
  trigger = null,
  isTwitterLoginEnabled,
  isGoogleLoginEnabled,
  isGithubLoginEnabled,
  isAuth0LoginEnabled,
}) {
  const router = useRouter()
  const { error } = router.query

  return (
    <Detail.Container>
      <TitleBar title="Log In" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-primary mb-3">- Please login - </p>

        {isTwitterLoginEnabled && (
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
        )}

        {isAuth0LoginEnabled && (
          <Button
            style={{ width: '190px', height: '38px' }}
            size="large"
            onClick={() =>
              signIn('auth0', {
                callbackUrl: `/signin-complete`,
                redirect: true,
              })
            }
          >
            <span>Login with Auth0</span>
          </Button>
        )}

        {isGoogleLoginEnabled && (
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
        )}

        {error && (
          <p className="text-sm text-rose-500 mt-3">
            {error == 'OAuthAccountNotLinked'
              ? 'Another account with the same email address exists already!'
              : error == 'OAuthCreateAccount'
              ? 'We were not able to create your account!'
              : error == 'Callback'
              ? "We've got invalid callback from the authentication provider!"
              : 'Unknown error!'}
          </p>
        )}
      </div>
    </Detail.Container>
  )
}
