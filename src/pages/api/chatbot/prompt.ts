import { NextApiRequest, NextApiResponse } from 'next'

import { getContext } from '~/graphql/context'
import calculateQuota from '~/lib/chatbot/calculateQuota'
import generateResopnse from '~/lib/chatbot/generateResponse'
import getDefaultPromptTemplate from '~/lib/chatbot/getDefaultPromptTemplate'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

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

    const context = await getContext({ req, res }, prisma)

    const userContext = `The human speaking to you has a username of ${context?.viewer?.name}. `
    const promptTemplate =
      context.site?.chatbot?.prompt_template ||
      getDefaultPromptTemplate(context?.owner?.name)

    const text = await generateResopnse({
      context,
      promptTemplate,
      history,
      question: prompt,
      apiKey: context.site?.chatbot?.openai_key,
      userContext,
    })
    res.json({
      success: true,
      answer: text,
    })
  } else {
    res.status(400).json({
      success: false,
      answer: null,
      message: 'Invalid request body',
    })
  }
}
