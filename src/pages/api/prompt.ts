import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import calculateQuota from '~/lib/chatbot/calculateQuota'
import generateResponse from '~/lib/chatbot/generateResponse'
import getDefaultPromptTemplate from '~/lib/chatbot/getDefaultPromptTemplate'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { prompt, history } = await req.body

  if (
    typeof prompt === 'string' &&
    Array.isArray(history) &&
    history.every((e) => typeof e === 'string')
  ) {
    const { total, usage } = await calculateQuota(req)
    if (usage >= total) {
      res.status(429).json({
        success: true,
        answer: `You've used up your quota of ${total} responses.  If you would like to increase your quota, you can add your own OpenAI API key in settings.`,
      })
      return
    }

    const context = await getContext({ req, res })

    const userContext = `The human speaking to you has a username of ${context?.viewer?.name}. `
    const promptTemplate =
      context.site?.chatbot?.prompt_template ||
      getDefaultPromptTemplate(context?.owner?.name)

    const resp = await generateResponse({
      promptTemplate,
      history,
      question: prompt,
      apiKey: context.site?.chatbot?.openai_key,
      userContext,
    })

    if (typeof resp === 'string') {
      // TODO: increase usage quota

      res.status(200).json({
        success: true,
        answer: resp,
      })
    } else {
      res.status(500).json({
        success: false,
        answer: null,
        message: 'Internal Server Error, Please try again',
      })
    }
  } else {
    res.status(400).json({
      success: false,
      answer: null,
      message: 'Invalid request body',
    })
  }
}
