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
    req,
    res,
  } = ctx

  const commonProps = await getCommonPageProps(ctx)
  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({
      query: GET_USER,
      variables: { username },
    }),
  ])

  return addApolloState(apolloClient, {
    props: {
      username,
      ...commonProps,
    },
  })
}
