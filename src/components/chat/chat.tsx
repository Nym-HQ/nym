'use client'

import { type Message, useChat } from 'ai/react'
import { toast } from 'react-hot-toast'

import { ChatList } from '~/components/chat/chat-list'
import { ChatPanel } from '~/components/chat/chat-panel'
import { ChatScrollAnchor } from '~/components/chat/chat-scroll-anchor'
import { EmptyScreen } from '~/components/chat/empty-screen'
import { cn } from '~/lib/utils'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  user: string
}

export function Chat({ id, initialMessages, className, user }: ChatProps) {
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: '/api/chatbot/stream',
      initialMessages,
      id,
      body: {
        id,
        user,
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
    })
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  )
}
