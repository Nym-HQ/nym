/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { getContext } from '~/graphql/context'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

function AdminPage(props) {
  const { data } = useContextQuery()

  return (
    <Detail.Container>
      <TitleBar title="Manage your site" globalMenu={true} magicTitle />

      <Detail.ContentContainer>
        <Detail.Title>Manage your site</Detail.Title>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

AdminPage.getLayout = function getLayout(page) {
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
  if (!graphqlData[0]?.data?.context?.viewer?.isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}

export default AdminPage
