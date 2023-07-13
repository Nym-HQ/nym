import { OpenAIStream, StreamingTextResponse } from 'ai'
import { PromptTemplate } from 'langchain/prompts'
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateModerationResponse,
  OpenAIApi,
} from 'openai-edge'

import getSite from '~/graphql/context/getSite'
// import { auth } from '~/lib/auth/nextauth'
import getDefaultPromptTemplate from '~/lib/chatbot/getDefaultPromptTemplate'
import { getTrainedIndex } from '~/lib/chatbot/train'
import { ApplicationError, UserError } from '~/lib/errors'
import { getSiteOwner } from '~/lib/multitenancy/server'
import prisma from '~/lib/prisma-edge'

export const config = {
  api: {},
  runtime: 'edge',
}

export default async function handler(req: Request) {
  try {
    const json =
      typeof req.json === 'function'
        ? await req.json()
        : JSON.parse((req as any).body)
    const { messages, user } = json

    const site = await getSite(prisma, req)
    const owner = site?.id ? await getSiteOwner(prisma, site.id) : null
    const apiKey = site?.chatbot?.openai_key
    const botAlias = owner?.name || 'AI'

    const configuration = new Configuration({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    })

    // Ask prompt to OpenAI
    const openai = new OpenAIApi(configuration)

    let completion,
      useChatMode = true

    const question = messages[messages.length - 1].content
    const historyMessages = messages.slice(0, messages.length - 1)

    // Moderate the content to comply with OpenAI T&C
    const sanitizedQuery = question.trim()
    const moderationResponse: CreateModerationResponse = await openai
      .createModeration({ input: sanitizedQuery })
      .then((res) => res.json())

    const [results] = moderationResponse.results

    if (results.flagged) {
      throw new UserError('Flagged content', {
        flagged: true,
        categories: results.categories,
      })
    }

    // Prompt engineering
    const promptTemplate =
      site?.chatbot?.prompt_template || getDefaultPromptTemplate(botAlias)

    //if (question.length > 500) {
    //return "Your question is too long.  Please reword it to be under 500 characters.";
    //}
    const vectorStore = await getTrainedIndex()
    if (!vectorStore) {
      throw new ApplicationError('No vector store found')
    }

    // Search the vector DB independently with meta filters
    const data = await vectorStore.similaritySearch(sanitizedQuery, 1, {
      siteId: site?.id,
    })

    const promptContext = []
    for (const item of data) {
      promptContext.push(`\nContext:\n${item.pageContent}`)
    }

    const prompt = new PromptTemplate({
      template: promptTemplate,
      inputVariables: ['history', 'context', 'question'],
    })

    if (useChatMode) {
      const promptString = await prompt.format({
        question: sanitizedQuery,
        context: promptContext.join('\n\n'),
        history: '',
      })
      console.debug('promptString', promptString)

      const chatMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content: promptString,
      }
      completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [...historyMessages, chatMessage],
        temperature: 0.7,
        stream: true,
        max_tokens: 512,
      })
    } else {
      const history = historyMessages
        .map(
          (m) =>
            (m.role === 'assistant' ? `${botAlias}: ` : 'User: ') + m.content
        )
        .join('\n\n')

      const promptString = await prompt.format({
        question: sanitizedQuery,
        context: promptContext.join('\n\n'),
        history,
      })
      console.debug('promptString', promptString)

      completion = await openai.createCompletion({
        model: 'text-davinci-003', // 'gpt-3.5-turbo',
        prompt: promptString,
        temperature: 0.7,
        max_tokens: 512,
        stream: true,
      })
    }

    const stream = OpenAIStream(completion)

    return new StreamingTextResponse(stream)
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message,
        data: err.data,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
