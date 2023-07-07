import { GetServerSideProps } from 'next/types'
import { NextSeo } from 'next-seo'
import { useRef } from 'react'

import { Chat } from '~/components/chat/chat'
import { Detail } from '~/components/ListDetail/Detail'
import { PoweredByNym } from '~/components/ListDetail/PoweredByNym'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import prisma from '~/lib/prisma'
import { nanoid } from '~/lib/utils'

export const config = {
  runtime: 'nodejs',
}

export default function ChatPage(props) {
  const { data: contextData } = useContextQuery()
  const scrollContainerRef = useRef(null)
  const id = nanoid()

  const owner = {
    name: contextData?.context?.owner?.name || 'Site Owner',
    image:
      contextData?.context?.owner?.avatar ||
      contextData?.context?.owner?.image ||
      contextData?.context?.site?.logo ||
      '/static/img/fallback-avatar.png',
  }

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
      <Detail.Container data-cy="chat-detail">
        <div className="flex flex-1 h-full">
          <div className="relative flex-col w-full">
            <Chat id={id} user={contextData?.context.viewer?.name} />
          </div>
        </div>
        <PoweredByNym scrollContainerRef={scrollContainerRef} />
      </Detail.Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)

  if (!context.viewer)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }

  const apolloClient = initApolloClient({ context })

  let graphqlData = await Promise.all(getCommonQueries(apolloClient))

  let commonProps = await getCommonPageProps(ctx, graphqlData[0])

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}
