import { type Message } from 'ai'

import { ChatMessage } from '~/components/chat/chat-message'
import { Separator } from '~/components/chat/ui/separator'

export interface ChatList {
  messages: Message[]
  setInput?: any
}

export function ChatList({ messages, ...props }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} setInput={props.setInput} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}
