import { OpenAIStream, StreamingTextResponse } from 'ai'
import { PromptTemplate } from 'langchain/prompts'
import { Configuration, OpenAIApi } from 'openai-edge'

import getSite from '~/graphql/context/getSite'
// import { auth } from '~/lib/auth/nextauth'
import getDefaultPromptTemplate from '~/lib/chatbot/getDefaultPromptTemplate'
import { getTrainedIndex } from '~/lib/chatbot/train'
import { getSiteOwner } from '~/lib/multitenancy/server'

export const config = {
  api: {},
  runtime: 'edge',
}

function textStreamResponse(text: String) {
  var Readable = require('stream').Readable

  var s = new Readable()
  s.push('beep')
  s.end()
  return new StreamingTextResponse(s)
}

export default async function handler(req: Request) {
  // const viewer = (await auth())?.user
  // const userId = viewer?.id

  const json =
    typeof req.json === 'function'
      ? await req.json()
      : JSON.parse((req as any).body)
  const { messages, user } = json
  const question = messages[messages.length - 1].content
  const history = messages
    .slice(0, messages.length - 1)
    .map((m) => (m.role === 'assistant' ? 'AI: ' : 'User: ') + m.content)
    .join('\n\n')

  // if (!userId) {
  //   return new Response('Unauthorized', {
  //     status: 401,
  //   })
  // }

  // const site = await getSite(req)
  // const owner = site?.id ? await getSiteOwner(site.id) : null
  const context = null,
    site = null,
    owner = null

  const promptTemplate =
    site?.chatbot?.prompt_template || getDefaultPromptTemplate(owner?.name)
  const apiKey = site?.chatbot?.openai_key
  const userContext = `The human speaking to you has a username of ${user}. `

  //if (question.length > 500) {
  //return "Your question is too long.  Please reword it to be under 500 characters.";
  //}
  const vectorStore = await getTrainedIndex(context)
  if (!vectorStore) {
    textStreamResponse('I am under training now.  Please try again later.')
  }

  /* Search the vector DB independently with meta filters */
  const data = await vectorStore.similaritySearch(question, 1, {
    siteId: site?.id,
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

  const completion = await openai.createCompletion({
    model: 'text-davinci-003', // 'gpt-3.5-turbo',
    prompt: await prompt.format({
      question,
      context: promptContext.join('\n\n'),
      history,
    }),
    temperature: 0.7,
    stream: true,
  })

  const stream = OpenAIStream(completion)

  return new StreamingTextResponse(stream)
}
