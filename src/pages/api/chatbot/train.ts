import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import {
  createIndex,
  deleteIndex,
  getIndexName,
  getTrainData,
  getTrainedIndex,
} from '~/lib/chatbot/train'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return
  }

  const context = await getContext({ req, res })
  const trainedIndex = await getTrainedIndex(context)

  if (trainedIndex !== null) deleteIndex(context)

  const trainData = await getTrainData(context)
  if (trainData.length > 0) {
    createIndex(context, trainData)
  } else {
    console.log('No data found to train chatbot', getIndexName(context))
  }

  res.status(200).json({
    success: true,
  })
}
