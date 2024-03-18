import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { ChatMessageActions } from '~/components/chat/chat-message-actions'
import { MemoizedReactMarkdown } from '~/components/chat/markdown'
import { Button } from '~/components/chat/ui/button'
import { CodeBlock } from '~/components/chat/ui/codeblock'
import { IconOpenAI, IconUser } from '~/components/chat/ui/icons'
import { cn } from '~/lib/utils'

export interface ChatMessageProps {
  message: Message
  setInput?: any
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-white dark:bg-black'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, className, children, ...props  }: any) {
              const inline = props.inline as boolean; // Use `as` to assert the type of `inline`
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            },
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        {(message as any).questions && (
          <ul>
            {(message as any).questions.map((question, i) => (
              <li key={`q-${i}`}>
                <Button
                  variant="outline"
                  className="mb-1 w-full flex justify-between h-auto"
                  onClick={() =>
                    typeof props.setInput === 'function' &&
                    props.setInput(question)
                  }
                >
                  <span className="text-left">{question}</span>
                  <span>&rarr;</span>
                </Button>
              </li>
            ))}
          </ul>
        )}

        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
