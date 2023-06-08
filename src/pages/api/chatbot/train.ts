import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import {
  createOrUpdateIndex,
  getIndexName,
  getTrainData,
} from '~/lib/chatbot/train'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return
  }

  const context = await getContext({ req, res })

  const { docs, ids } = await getTrainData(context)
  if (docs.length > 0) {
    await createOrUpdateIndex(context, docs, ids)
  } else {
    console.log('No data found to train chatbot', getIndexName(context))
  }

  res.status(200).json({
    success: true,
  })
}