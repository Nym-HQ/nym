export default function getDefaultPromptTemplate(
  name: string,
  includeHistory = false,
  suggestQuestions = 3
) {
  return (
    `Answer to the Human's question at best you can, based on chat history and Memory Context.` +
    ` When you don't find anything appropriate to respond from Memory Context, reply with this instead: 'I don't have anything in my training set related to that. but would you like me to use the ChatGPT model to answer you?'.` +
    ` If the Human responds 'Ok' or 'Yes', then give them an appropriate response.` +
    (suggestQuestions > 0
      ? ` At the end of your answer, suggest the Human up to ${suggestQuestions} questions to ask you based on the current Memory Context.` +
        ` Prefix each suggested questions with '>> ' and suffix with a newline.`
      : '') +
    `\n>> Memory Context: {context}\n` +
    (includeHistory ? `\n>> Chat History: {history} : '')` : '') +
    `\n--\n` +
    `Human: {question}` +
    `You:`
  )
}
