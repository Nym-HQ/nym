import { Context } from '@apollo/client'
import { TwitterApi } from 'twitter-api-v2'

import { MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

export default async function getTwitterApiClient(
  context: Context
): Promise<TwitterApi> {
  const { prisma } = context

  const account = await prisma.account.findFirst({
    where: {
      userId: context.viewer.id,
      provider: 'twitter',
    },
  })

  if (!account.refresh_token) {
    throw new Error('No refresh token')
  }

  const supportRefreshToken = false
  let twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  })

  // NOTE: Twitter returns refresh token, only on the first authorization.
  if (supportRefreshToken) {
    console.debug('Refreshing tokens...')
    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(account.refresh_token)

    // update the account record with the new tokens
    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      },
    })
    twitterClient = refreshedClient
  } else {
    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.loginWithOAuth2({
      code: account.refresh_token,
      codeVerifier: 'refresh_token',
      redirectUri: `https://${MAIN_APP_DOMAIN}/signin-complete`,
    })
    twitterClient = refreshedClient
  }

  return twitterClient
}
