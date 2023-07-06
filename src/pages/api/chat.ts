import { OpenAIStream, StreamingTextResponse } from 'ai'
import { PromptTemplate } from 'langchain/prompts'
import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai-edge'

import { getContext } from '~/graphql/context'
import getDefaultPromptTemplate from '~/lib/chatbot/getDefaultPromptTemplate'
import { getTrainedIndex } from '~/lib/chatbot/train'

export const config = {
  runtime: 'edge',
  unstable_allowDynamic: [
    // allows a single file
    '~/graphql/context',
  ],
}

export default async function handler(req: Request) {
  const context = await getContext({ req, res: new NextResponse() })

  const json =
    typeof req.json === 'function'
      ? await req.json()
      : JSON.parse((req as any).body)
  const { prompt: question, history } = json
  const userId = context.viewer?.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const promptTemplate =
    context.site?.chatbot?.prompt_template ||
    getDefaultPromptTemplate(context?.owner?.name)
  const apiKey = context.site?.chatbot?.openai_key
  const userContext = `The human speaking to you has a username of ${context?.viewer?.name}. `

  //if (question.length > 500) {
  //return "Your question is too long.  Please reword it to be under 500 characters.";
  //}
  const vectorStore = await getTrainedIndex(context)
  if (!vectorStore) {
    return 'I am under training now.  Please try again later.'
  }

  /* Search the vector DB independently with meta filters */
  const data = await vectorStore.similaritySearch(question, 1, {
    siteId: context.site.id,
  })

  const promptContext = []
  if (userContext) promptContext.push(userContext)
  for (const item of data) {
    promptContext.push(`Context:\n${item.pageContent}`)
  }

  const configuration = new Configuration({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  })

  // Ask prompt to OpenAI
  const openai = new OpenAIApi(configuration)

  const prompt = new PromptTemplate({
    template: promptTemplate,
    inputVariables: ['history', 'context', 'question'],
  })

  const res = await openai.createCompletion({
    model: 'gpt-3.5-turbo',
    prompt: await prompt.format({
      question,
      context: promptContext.join('\n\n'),
      history,
    }),
    temperature: 0.7,
    stream: true,
  })

  const stream = OpenAIStream(res)

  return new StreamingTextResponse(stream)
}
