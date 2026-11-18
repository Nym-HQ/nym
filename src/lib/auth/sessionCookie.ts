// Single source of truth for the next-auth session cookie name/flags, shared by
// the next-auth config and the cross-site login routes.
export const SESSION_COOKIE_SECURE = !!process.env.VERCEL_URL

export const SESSION_COOKIE_NAME = `${
  SESSION_COOKIE_SECURE ? '__Secure-' : ''
}next-auth.session-token`
