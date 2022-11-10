/**
 * "/hq" URL will only be accessble from "app" subdomain
 * These pages will be used by Super-admin only
 *
 */

import { NextPageContext } from 'next'
import * as React from 'react'

import { SiteLayout } from '~/components/Layouts'
import { getContext } from '~/graphql/context'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function HqPage(props) {
  return (
    <>
      <h1>Coming Soon</h1>
      <p>
        Headquater Pages will be used to manage contents of the user's sites
      </p>
    </>
  )
}

HqPage.getLayout = function getLayout(page) {
  return <SiteLayout>{page}</SiteLayout>
}

export async function getServerSideProps(ctx: NextPageContext) {
  const commonProps = await getCommonPageProps(ctx)

  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  await Promise.all([...getCommonQueries(apolloClient)])

  return addApolloState(apolloClient, {
    props: {
      ...commonProps,
    },
  })
}

export default HqPage
