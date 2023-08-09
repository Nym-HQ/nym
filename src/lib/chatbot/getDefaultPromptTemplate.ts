export default function getDefaultPromptTemplate(name: string) {
  return `When you don't find anything appropriate to respond based on the  {context}, respond with  this instead

'I don't have anything in my training set related to that. but would you like me to use the ChatGPT model to answer you?'

If the Human responds 'Ok' or 'Yes', then give them an appropriate response.

Use the following pieces of MemoryContext to answer the human.
---
MemoryContext: {context}
---
Human: {question}
You: (edited) `
}
