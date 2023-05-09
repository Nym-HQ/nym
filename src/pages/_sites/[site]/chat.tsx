import type { NextApiRequest, NextApiResponse } from 'next'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { Trash } from 'react-feather'

import Button from '~/components/Button'
import { ChatMessage } from '~/components/chat/ChatMessage'
import { Textarea } from '~/components/Input'
import { ListDetailView } from '~/components/Layouts'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import useType from '~/hooks/useType'

const loadingMessages = [
  'Hold on while I think...',
  'Thinking...',
  'Hmm...',
  'Interesting...',
  'Evaluating your question...',
  'Hold up a sec...',
  'Uh...',
]

export function ChatWindow(props) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [randomLoadMessage, setRandomLoadingMessage] = useState(
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  )

  const taRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const lastMessage = useType(history)

  const submit = async (v: string) => {
    if (!v) return
    const historyQueryParam = []
    let totalLength = 0

    setRandomLoadingMessage(
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    )
    setLoading(true)
    setHistory((hist) => {
      const out = [
        ...hist,
        {
          username: 'username',
          userImage: 'image',
          message: v,
          isPresenter: false,
        },
      ]
      for (let i = 0; i < out.length; i++) {
        totalLength += out[i].message.length
        if (totalLength + out[i].message.length <= 3500) {
          historyQueryParam.push(out[i])
        }
      }
      return out
    })
    const { answer, success, message } = await fetch('/api/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        prompt: v,
        history: historyQueryParam.map(
          ({ message, isPresenter }) =>
            `${isPresenter ? 'Adam Breckler' : 'Human'}: ${message}`
        ),
      }),
    }).then((r) => r.json())

    if (success) {
      setHistory((hist) => [
        ...hist,
        {
          username: 'Adam Breckler',
          userImage: '/amjad.jpeg',
          message: answer,
          isPresenter: true,
        },
      ])
      setLoading(false)
      setValue('')
      updateFocusAndScroll()
    } else {
      setHistory((hist) => [
        ...hist,
        {
          username: 'Adam Breckler',
          userImage: '/amjad.jpeg',
          message: `An error occurred: ${message}`,
          isPresenter: true,
        },
      ])
      setLoading(false)
      updateFocusAndScroll()
    }
  }

  const updateFocusAndScroll = () => {
    scrollRef?.current?.scrollIntoView()
    taRef?.current?.focus()
  }

  useEffect(() => {
    updateFocusAndScroll()
  }, [history, loading, lastMessage])

  return (
    <>
      <Head>
        <title>Adam Breckler Chatbot</title>
      </Head>

      <div className="flex flex-col w-96 mx-auto p-1 bg-gray-900">
        <div className="w-full flex border-gray-200 p-1">
          <div className="flex-1"></div>
          <Button alt="Clear Chat" size="small" onClick={() => setHistory([])}>
            <Trash />
          </Button>
        </div>

        <div className="w-full flex-grow flex-col flex-1">
          {history.map(({ message, userImage, username, isPresenter }, i) => (
            <ChatMessage
              key={i}
              message={
                i === history.length - 1 && isPresenter
                  ? lastMessage.join(' ')
                  : message
              }
              userImage={userImage}
              username={username}
              isPresenter={isPresenter}
            />
          ))}

          {loading ? (
            <ChatMessage
              message={randomLoadMessage}
              userImage="/amjad.jpeg"
              username="Adam Breckler"
              isPresenter
              loading={loading}
            />
          ) : null}

          <div ref={scrollRef}></div>
        </div>

        <div className="flex flex-row space-x-2">
          <Textarea
            placeholder="Type a message..."
            className="flex-grow resize-none w-full text-base text-primary"
            style={{
              opacity: loading ? 0.5 : 1,
            }}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!e.shiftKey) {
                  e.preventDefault()
                  submit(value)
                }
              }
            }}
            disabled={loading}
            ref={taRef}
          />
          <Button
            onClick={() => submit(value)}
            disabled={loading}
            colorway="primary"
            iconLeft={loading ? <LoadingSpinner /> : null}
          >
            Send
          </Button>
        </div>
      </div>
    </>
  )
}

export default function ChatPage(pageProps) {
  return (
    <ListDetailView
      list={null}
      hasDetail
      detail={<ChatWindow {...pageProps} />}
    />
  )
}

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}) {
  // if (req.headers["x-replit-user-id"]) {
  //   return {
  //     props: {
  //       image: req.headers["x-replit-user-profile-image"],
  //       username: req.headers["x-replit-user-name"],
  //     },
  //   };
  // } else {
  //   res.setHeader("set-cookie", "REPL_AUTH=FFFFFFFF; Max-Age=0;");
  //   return {
  //     redirect: {
  //       destination: "/login",
  //     },
  //   };
  // }
  return {
    props: {
      image: '/question_icon.png',
      username: 'Playground',
    },
  }
}
