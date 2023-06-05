import { Context } from '@apollo/client'
import { TweetV2 } from 'twitter-api-v2'

import getTwitterApiClient from './getTwitterApiClient'

export default async function getTwitterTimeline(
  context: Context
): Promise<TweetV2[]> {
  const twitterClient = await getTwitterApiClient(context)

  const { prisma } = context
  const account = await prisma.account.findFirst({
    where: {
      userId: context.viewer.id,
      provider: 'twitter',
    },
  })

  const response = await twitterClient.v2.userTimeline(
    account.providerAccountId,
    {
      exclude: 'retweets',
      'tweet.fields': ['created_at', 'text'],
      max_results: 500,
    }
  )

  return response.data.data
}
