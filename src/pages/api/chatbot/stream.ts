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

    // separate the question and chat history
    const question = messages[messages.length - 1].content
    const sanitizedQuery = question.trim()
    const historyMessages = messages.slice(0, messages.length - 1)

    // create OpenAI client
    const configuration = new Configuration({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)

    let completion,
      useChatMode = true

    // Moderate the content to comply with OpenAI T&C
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

    // if (question.length > 500) {
    //   return 'Your question is too long.  Please reword it to be under 500 characters.'
    // }

    // Look up trained index, for relevant chat context
    const vectorStore = await getTrainedIndex()
    if (!vectorStore) {
      throw new ApplicationError('No vector store found')
    }
    const data = await vectorStore.similaritySearch(sanitizedQuery, 1, {
      siteId: site?.id,
    })

    // Generate the prompt context
    const contextPieces = []
    let contextNum = 1
    for (const item of data) {
      contextPieces.push(`Context Piece ${contextNum}: ${item.pageContent}`)
      contextNum++
    }

    // Generate response using appropriate mode
    if (useChatMode) {
      completion = await useChatCompletionMode(openai, historyMessages, {
        botAlias,
        question: sanitizedQuery,
        contextPieces,
      })
    } else {
      completion = await useTextCompletionMode(openai, historyMessages, {
        botAlias,
        question: sanitizedQuery,
        contextPieces,
      })
    }

    // Return the response as a stream
    const stream = OpenAIStream(completion)
    return new StreamingTextResponse(stream)
  } catch (err) {
    console.error('Error generating response', err)
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

async function useChatCompletionMode(
  openai,
  historyMessages,
  { botAlias, question, contextPieces }
) {
  // Prompt engineering
  // const promptTemplate =
  //   site?.chatbot?.prompt_template || getDefaultPromptTemplate(botAlias)
  const promptTemplate = getDefaultPromptTemplate(botAlias)

  const prompt = new PromptTemplate({
    template: promptTemplate,
    inputVariables: ['context', 'question'],
  })

  const promptString = await prompt.format({
    question: question,
    context: '\n' + contextPieces.join('\n\n'),
  })
  console.info('promptString', promptString.substring(0, 1000) + '...')

  const chatMessage: ChatCompletionRequestMessage = {
    role: 'user',
    content: promptString,
  }
  return await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [...historyMessages, chatMessage],
    temperature: 0.7,
    stream: true,
    max_tokens: 512,
  })
}

async function useTextCompletionMode(
  openai,
  historyMessages,
  { botAlias, question, contextPieces }
) {
  // Prompt engineering
  // const promptTemplate =
  //   site?.chatbot?.prompt_template || getDefaultPromptTemplate(botAlias)
  const promptTemplate = getDefaultPromptTemplate(botAlias, true)

  const prompt = new PromptTemplate({
    template: promptTemplate,
    inputVariables: ['history', 'context', 'question'],
  })

  const history = historyMessages
    .map((m) => (m.role === 'assistant' ? `You: ` : 'Human: ') + m.content)
    .join('\n\n')

  const promptString = await prompt.format({
    question,
    context: '\n' + contextPieces.join('\n\n'),
    history,
  })
  console.info('promptString', promptString.substring(0, 1000) + '...')

  return await openai.createCompletion({
    model: 'text-davinci-003', // 'gpt-3.5-turbo',
    prompt: promptString,
    temperature: 0.7,
    max_tokens: 512,
    stream: true,
  })
}
