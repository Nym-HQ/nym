import { NextSeo } from 'next-seo'
import { useEffect, useRef, useState } from 'react'
import { Trash } from 'react-feather'

import Button from '~/components/Button'
import { ChatMessage } from '~/components/chat/ChatMessage'
import { Textarea } from '~/components/Input'
import { ListDetailView } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { PoweredByNym } from '~/components/ListDetail/PoweredByNym'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { useContextQuery } from '~/graphql/types.generated'
import useType from '~/hooks/useType'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import {
  createIndex,
  getIndexName,
  getTrainData,
  getTrainedIndex,
} from '~/lib/chatbot/train'
import { getCommonPageProps } from '~/lib/commonProps'

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
  const { data: contextData } = useContextQuery()
  const scrollContainerRef = useRef(null)
  const titleRef = useRef(null)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [randomLoadMessage, setRandomLoadingMessage] = useState(
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  )

  const taRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const lastMessage = useType(history)

  const owner = {
    name: contextData?.context?.owner?.name || 'Site Owner',
    image:
      contextData?.context?.owner?.avatar ||
      contextData?.context?.owner?.image ||
      '/static/favicon.ico',
  }

  const visitor = {
    name: contextData?.context?.viewer?.name || 'You',
    image:
      contextData?.context?.owner?.avatar ||
      contextData?.context?.owner?.image ||
      '/static/favicon.ico',
  }

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
          username: visitor.name,
          userImage: visitor.image,
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
            `${isPresenter ? owner.name : visitor.name}: ${message}`
        ),
      }),
    }).then((r) => r.json())

    if (success) {
      setHistory((hist) => [
        ...hist,
        {
          username: owner.name,
          userImage: owner.image,
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
          username: owner.name,
          userImage: owner.image,
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

  const seo = extendSEO(
    {
      title: `${owner.name} Chatbot`,
      description: '',
    },
    contextData?.context?.site
  )

  return (
    <>
      <NextSeo {...seo} />
      <Detail.Container data-cy="question-detail" ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/'}
          magicTitle
          title={`Chat with ${owner.name}`}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          trailingAccessory={
            <>
              <Button
                alt="Clear Chat"
                size="small"
                onClick={() => setHistory([])}
              >
                <Trash />
              </Button>
            </>
          }
        />
        <div className="flex flex-1 flex-col w-96 mx-auto p-1 bg-gray-900">
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
                userImage={owner.image}
                username={owner.name}
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
            >
              {loading ? <LoadingSpinner /> : null} Send
            </Button>
          </div>
        </div>

        <PoweredByNym scrollContainerRef={scrollContainerRef} />
      </Detail.Container>
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

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)

  if (!context.viewer)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }

  const apolloClient = initApolloClient({ context })

  const trainedIndex = await getTrainedIndex(context)
  if (trainedIndex === null) {
    const trainData = await getTrainData(context)
    if (trainData.length > 0) {
      createIndex(context, trainData)
    } else {
      console.log('No data found to train chatbot', getIndexName(context))
    }
  } else {
    console.log('Found trained index', getIndexName(context))
  }

  let graphqlData = await Promise.all(getCommonQueries(apolloClient))

  let commonProps = await getCommonPageProps(ctx, graphqlData[0])

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}
