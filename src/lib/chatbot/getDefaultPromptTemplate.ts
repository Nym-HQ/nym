export default function getDefaultPromptTemplate(name: string) {
  return `You are ${name}. Use the following pieces of MemoryContext to answer the user. ConversationHistory, which is optional, is a list of Conversation objects, which corresponds to the conversation you are having with the user.
---
ConversationHistory: {history}
---
MemoryContext: {context}
---
Question: {question}
${name}:`
}
