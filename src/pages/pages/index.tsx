import { NextSeo } from 'next-seo'
import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { PagesList } from '~/components/Page/PagesList'
import routes from '~/config/routes'
import { getContext } from '~/graphql/context'
import { GET_PAGES } from '~/graphql/queries/pages'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function PagePage(props) {
  return (
    <NextSeo
      title={routes.pages.seo.title}
      description={routes.pages.seo.description}
      openGraph={routes.pages.seo.openGraph}
    />
  )
}

export async function getServerSideProps(ctx) {
  const { req, res } = ctx

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
      query: GET_PAGES,
      variables: {
        filter: { published: true, featuredOnly: false, includeHomepage: true },
      },
    }),
  ])

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}

PagePage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={<PagesList />} hasDetail={false} detail={page} />
    </SiteLayout>
  )
}

export default PagePage
