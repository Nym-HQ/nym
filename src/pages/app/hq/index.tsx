/**
 * "/hq" URL will only be accessble from "app" subdomain
 * These pages will be used by Super-admin only
 *
 */

import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { SiteLayout } from '~/components/Layouts'
import { getContext } from '~/graphql/context'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)
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
    props: {
      ...commonProps,
    },
  })
}

export default HqPage
