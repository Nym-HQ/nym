import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'

import { authOptions } from '~/lib/auth/nextauth'

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.nextauth.includes('callback')) {
    console.info(
      'Handling callback request from my Identity Provider',
      req.body,
      req.query
    )
  }

  if (
    process.env.TWITTER_OAUTH_VER != '2.0' &&
    req.query.nextauth.includes('twitter') &&
    req.query.nextauth.includes('signin')
  ) {
    // A little hack around the next-auth bug, to attach "force_login" paramter for Twitter Oauth
    // https://developer.twitter.com/en/docs/authentication/api-reference/authenticate
    const orig_json = res.json
    res.json = (body: any) => {
      if (
        body &&
        typeof body.url === 'string' &&
        body.url.includes('https://api.twitter.com/oauth/authenticate')
      ) {
        body.url += '&force_login=true'
      }
      return orig_json.call(res, body)
    }
  }

  await NextAuth(req, res, authOptions)
}
