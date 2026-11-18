import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getSignInErrorMessage,
  OAUTH_ACCOUNT_NOT_LINKED_MESSAGE,
  UNKNOWN_SIGN_IN_ERROR_MESSAGE,
} from './signInErrors'

describe('email account linking', () => {
  it('no configured provider allows dangerous email account linking', async () => {
    // Placeholder values only, so every provider branch is registered.
    Object.assign(process.env, {
      AUTH0_CLIENT_ID: 'test',
      AUTH0_CLIENT_SECRET: 'test',
      AUTH0_ISSUER_BASE_URL: 'https://auth0.example.invalid',
      GOOGLE_CLIENT_ID: 'test',
      GOOGLE_CLIENT_SECRET: 'test',
      TWITTER_API_KEY: 'test',
      TWITTER_API_SECRET: 'test',
      GITHUB_ID: 'test',
      GITHUB_SECRET: 'test',
    })
    const { authOptions } = await import('./nextauth')
    const ids = authOptions.providers.map((p) => p.id).sort()
    assert.deepEqual(ids, ['auth0', 'github', 'google', 'twitter'])
    for (const provider of authOptions.providers) {
      const p = provider as any
      assert.notEqual(p.allowDangerousEmailAccountLinking, true, p.id)
      assert.notEqual(p.options?.allowDangerousEmailAccountLinking, true, p.id)
    }
  })

  it('sends sign-in errors to the login page', async () => {
    const { authOptions } = await import('./nextauth')
    assert.equal(authOptions.pages?.error, '/login')
  })
})

describe('getSignInErrorMessage', () => {
  it('explains OAuthAccountNotLinked', () => {
    assert.equal(
      getSignInErrorMessage('OAuthAccountNotLinked'),
      OAUTH_ACCOUNT_NOT_LINKED_MESSAGE
    )
    assert.equal(
      getSignInErrorMessage(['OAuthAccountNotLinked']),
      OAUTH_ACCOUNT_NOT_LINKED_MESSAGE
    )
  })

  it('returns null without an error and a fallback for unknown codes', () => {
    assert.equal(getSignInErrorMessage(undefined), null)
    assert.equal(getSignInErrorMessage(''), null)
    assert.equal(getSignInErrorMessage('Nope'), UNKNOWN_SIGN_IN_ERROR_MESSAGE)
  })
})
