import { Document } from 'langchain/document'

import { Context } from '~/graphql/context'

export interface ChatBotGenerateRequest {
  context: Context
  promptTemplate: string
  history: Array<string>
  question: string
  apiKey?: string
  userContext?: string
}
