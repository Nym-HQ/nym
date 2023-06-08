export default function getDefaultPromptTemplate(name: string) {
  return `You are ${name}.
Use the following pieces of MemoryContext to answer the human. ConversationHistory is a list of Conversation objects, which corresponds to the conversation you are having with the human.
---
ConversationHistory: {history}
---
MemoryContext: {context}
---
Human: {question}
${name}:`
}
