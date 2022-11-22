import * as React from 'react'

import { ListDetailView } from '~/components/Layouts'
import { UserDetail } from '~/components/UserProfile/UserDetail'
import { getContext } from '~/graphql/context'
import { GET_USER } from '~/graphql/queries/user'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

export default function UserPage(props) {
  const { username } = props
  return (
    <ListDetailView
      list={null}
      hasDetail
      detail={<UserDetail username={username} />}
    />
  )
}

export async function getServerSideProps(ctx) {
  const {
    params: { username },
  } = ctx

  const context = await getContext(ctx)
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
