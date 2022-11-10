/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import * as React from 'react'

import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { getContext } from '~/graphql/context'
import { useViewerQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function AdminPage(props) {
  const { data } = useViewerQuery()

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

export async function getServerSideProps(ctx) {
  const commonProps = await getCommonPageProps(ctx)
  const { req, res } = ctx

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
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])

  if (!graphqlData[1]?.data?.viewer?.isViewerSiteAdmin) {
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
