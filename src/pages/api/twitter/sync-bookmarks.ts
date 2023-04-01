import { SiteRole } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { TwitterApi } from 'twitter-api-v2'

import { getContext } from '~/graphql/context'
import { MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

/**
 * Sync twitter bookmarks
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const context = await getContext({ req, res })
  if (!context.viewer.id || context.userSite.siteRole !== SiteRole.OWNER) {
    return res.status(401).json({})
  }

  const { prisma } = context

  const account = await prisma.account.findFirst({
    where: {
      userId: context.viewer.id,
      provider: 'twitter',
    },
  })

  if (!account.refresh_token)
    return res.status(401).json({
      success: false,
      message: 'No refresh token',
    })

  // const reqUrl = new URL(req.headers.origin)
  // const redirectUri = `${reqUrl.protocol}//${MAIN_APP_DOMAIN}/api/auth/callback/twitter`

  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  })

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

  console.debug(`Getting bookmarks for user ${context.viewer.id}...`)
  const bookmarks = await refreshedClient.v2.bookmarks({
    expansions: [
      // 'attachments.media_keys',
      // 'attachments.poll_ids',
      'referenced_tweets.id',
      // 'referenced_tweets.id.author_id',
      'author_id',
      // 'entities.mentions.username',
      // 'in_reply_to_user_id',
    ],
  })

  for await (const bookmark of bookmarks) {
    // TODO: save bookmark into our bookmark
    const tweetUrl = `https://twitter.com/${bookmark.author_id}/status/${bookmark}`
    console.debug('twitter bookmark', bookmark, tweetUrl)
  }

  console.debug(
    `Completed refreshing Twitter bookmarks for user ${context.viewer.id}`
  )
  return res.status(200).json({
    success: 1,
    message: 'Successfully synced Twitter bookmarks!',
  })
}
