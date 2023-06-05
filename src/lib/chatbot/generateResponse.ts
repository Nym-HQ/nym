import { LLMChain, PromptTemplate } from 'langchain'
import { OpenAI } from 'langchain/llms/openai'

import { getTrainedIndex } from './train'
import { ChatBotGenerateRequest } from './types'

const generateResponse = async (request: ChatBotGenerateRequest) => {
  const { promptTemplate, history, question, apiKey, userContext } = request
  //if (question.length > 500) {
  //return "Your question is too long.  Please reword it to be under 500 characters.";
  //}

  try {
    const vectorStore = await getTrainedIndex(request)

    if (!vectorStore) {
      return 'I am not trained yet.  Please try again later.'
    }

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
