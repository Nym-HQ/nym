export default function getDefaultPromptTemplate(name: string) {
  return `You are having a chat with a user. Use the following pieces of MemoryContext to answer the user. ConversationHistory, which is optional, is a list of Conversation objects, which corresponds to the conversation you are having with the user.
---
ConversationHistory: {history}
---
MemoryContext: {context}
---
Question: {question}
Answer:`
}
