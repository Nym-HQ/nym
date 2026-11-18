// Maps next-auth v4 sign-in error codes (passed to pages.error as ?error=)
// to messages shown on the login page.
export const OAUTH_ACCOUNT_NOT_LINKED_MESSAGE =
  'This email is already registered with a different sign-in method. Sign in with the one you used before.'

const MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: OAUTH_ACCOUNT_NOT_LINKED_MESSAGE,
  OAuthCreateAccount: 'We were not able to create your account!',
  Callback: "We've got invalid callback from the authentication provider!",
}

export const UNKNOWN_SIGN_IN_ERROR_MESSAGE = 'Unknown error!'

export function getSignInErrorMessage(
  error: string | string[] | undefined | null
): string | null {
  if (!error) return null
  const code = Array.isArray(error) ? error[0] : error
  return MESSAGES[code] ?? UNKNOWN_SIGN_IN_ERROR_MESSAGE
}
