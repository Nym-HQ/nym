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
  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    setMessages,
  } = useChat({
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
    onFinish(message: Message) {
      if (/^>> (.*)/gm.test(message?.content)) {
        let answer,
          questions = []
        message.content.split(/^>> /gm).forEach((p, idx) => {
          if (idx === 0) {
            answer = p.trim()
          } else {
            questions.push(p.trim())
          }
        })
        message.content = answer
        ;(message as any).questions = questions.filter(
          (question) => question.length > 0
        )

        if (messages.find((m) => m.id === message.id)) {
          setMessages([...messages.slice(0, messages.length - 1), message])
        } else {
          setMessages([...messages, message])
        }
      }
    },
  })
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} setInput={setInput} />
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
