import { PineconeClient } from '@pinecone-database/pinecone'
import { LLMChain, PromptTemplate } from 'langchain'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAI } from 'langchain/llms/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

type ChatBotGenerateRequest = {
  promptTemplate: string
  history: Array<string>
  question: string
  apiKey?: string
  userContext?: string
  getIndexName: () => string
  getTrainData: () => Promise<Document[]>
}

const getOrTrainIndex = async ({
  getIndexName,
  getTrainData,
}: ChatBotGenerateRequest) => {
  const client = new PineconeClient()
  client.init({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
  })

  const indexName = getIndexName()
  const indexes = await client.listIndexes()

  let pineconeIndex
  if (indexes.includes(indexName)) {
    pineconeIndex = await client.Index(indexName)

    return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
      pineconeIndex,
    })
  } else {
    console.log('Creating index')
    pineconeIndex = await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: 512,
        metric: 'cosine',
        shards: 1,
      },
    })

    const docs = await getTrainData()

    console.log('Initializing Store...')

    return await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex,
    })
  }
}

const generateResponse = async (request: ChatBotGenerateRequest) => {
  const {
    promptTemplate,
    history,
    question,
    apiKey,
    userContext,
    getIndexName,
    getTrainData,
  } = request
  //if (question.length > 500) {
  //return "Your question is too long.  Please reword it to be under 500 characters.";
  //}

  try {
    const model = new OpenAI({
      temperature: 0,
      openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
    })
    const prompt = new PromptTemplate({
      template: promptTemplate,
      inputVariables: ['history', 'context', 'question'],
    })
    const llmChain = new LLMChain({
      llm: model,
      prompt,
    })

    const vectorStore = await getOrTrainIndex(request)

    /* Search the vector DB independently with meta filters */
    const data = await vectorStore.similaritySearch(question, 1, {
      foo: 'bar',
    })

    const context = []
    if (userContext) context.push(userContext)
    for (const item of data) {
      context.push(`Context:\n${item.pageContent}`)
    }

    return await llmChain.predict({
      question,
      context: context.join('\n\n'),
      history,
    })
  } catch (e) {
    return e.toString()
  }
}

export default generateResponse
