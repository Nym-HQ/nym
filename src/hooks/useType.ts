import { useEffect, useState } from 'react'

import { ChatMessageType } from '~/components/chat/ChatMessage'

export default function useType(history: Array<ChatMessageType>) {
  const [output, setOutput] = useState<Array<string>>([])
  const speed = 50

  const fire = () => {
    const lastMessage = history.at(-1)
    const words = lastMessage
      ? lastMessage.message.split(' ').filter((x) => x.length)
      : []
    let index = 0
    const iteration = () => {
      setOutput((o) => [...o, words[index]])
      if (index < words.length) {
        setTimeout(() => {
          index++
          iteration()
        }, words[index].length * speed)
      }
    }
    iteration()
  }

  useEffect(() => {
    if (history.length) {
      setOutput([])
      fire()
    }
  }, [history])

  return output
}
