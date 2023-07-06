import { SiteRole } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import { ADD_BOOKMARK } from '~/graphql/mutations/bookmarks'
import { initApolloClient } from '~/lib/apollo'
import getTwitterApiClient from '~/lib/tweet/getTwitterApiClient'

export const config = {
  runtime: 'nodejs',
}

/**
 * Sync twitter bookmarks
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const context = await getContext({ req, res })
  if (!context.viewer.id || context.userSite.siteRole !== SiteRole.OWNER) {
    return res.status(401).json({})
  }

  const apolloClient = initApolloClient({ context })

  try {
    const twitterClient = await getTwitterApiClient(context)

    console.debug(`Getting bookmarks for user ${context.viewer.id}...`)
    const bookmarks = await twitterClient.v2.bookmarks({
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
      const tweetUrl = `https://twitter.com/${bookmark.author_id}/status/${bookmark}`
      console.debug('twitter bookmark', bookmark, tweetUrl)

      try {
        apolloClient.mutate({
          mutation: ADD_BOOKMARK,
          variables: {
            data: {
              url: tweetUrl,
            },
          },
        })
      } catch (e) {
        console.error('Error adding Twitter bookmark', bookmark, tweetUrl, e)
      }
    }

    console.debug(
      `Completed refreshing Twitter bookmarks for user ${context.viewer.id}`
    )
    return res.status(200).json({
      success: 1,
      message: 'Successfully synced Twitter bookmarks!',
    })
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: e.toString(),
    })
  }
}
