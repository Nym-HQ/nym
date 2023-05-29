import { LLMChain, PromptTemplate } from 'langchain'
import { OpenAIEmbeddings } from 'langchain/embeddings'
import { OpenAI } from 'langchain/llms'
import { HNSWLib } from 'langchain/vectorstores'
import path from 'path'

let store: HNSWLib

let storeLoader = (async () => {
  const storePath = path.join(process.cwd(), 'vectorStore')
  console.log('Loading vector store from ' + storePath)
  store = await HNSWLib.load(storePath, new OpenAIEmbeddings())
  console.clear()
  console.log('Loaded vector store.')
})()

const generateResponse = async ({
  promptTemplate,
  history,
  question,
  apiKey,
  userContext,
}: {
  promptTemplate: string
  history: Array<string>
  question: string
  apiKey?: string
  userContext?: string
}) => {
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

    if (!store) {
      await storeLoader
    }

    const data = await store.similaritySearch(question, 1)
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
