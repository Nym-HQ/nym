import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { ListDetailView } from '~/components/Layouts'
import { UserDetail } from '~/components/UserProfile/UserDetail'
import { getContext } from '~/graphql/context'
import { GET_USER } from '~/graphql/queries/user'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

export default function UserPage(props) {
  const { data: context } = useContextQuery()
  const { username } = props

  return (
    <ListDetailView
      list={null}
      hasDetail
      detail={<UserDetail username={username} />}
    />
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const {
    params: { username },
  } = ctx

  const context = await getContext(ctx, prisma)
  const apolloClient = initApolloClient({ context })

  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({
      query: GET_USER,
      variables: { username },
    }),
  ])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])
  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  return addApolloState(apolloClient, {
    props: {
      username,
      ...commonProps,
    },
  })
}
