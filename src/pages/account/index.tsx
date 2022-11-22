/**
 * "/account" URL will only be accessble from "app" subdomain
 * These pages will be used to manage user's accounts and sites
 *
 */

import { NextPageContext } from 'next'
import * as React from 'react'

import { SiteLayout } from '~/components/Layouts'
import { getContext } from '~/graphql/context'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function AccountPage(props) {
  return (
    <>
      <h1>Coming Soon</h1>
      <p>Account Pages will be used to manage contents of the user's sites</p>
    </>
  )
}

AccountPage.getLayout = function getLayout(page) {
  return <SiteLayout>{page}</SiteLayout>
}

export async function getServerSideProps(ctx: NextPageContext) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])
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
    props: { ...commonProps },
  })
}

export default AccountPage
