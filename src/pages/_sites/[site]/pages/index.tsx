import { NextSeo } from 'next-seo'
import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { PagesList } from '~/components/Page/PagesList'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { GET_PAGES } from '~/graphql/queries/pages'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

export const config = {
  runtime: 'nodejs',
}

function PagePage(props) {
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.pages.seo, context.context.site)

  return <NextSeo {...seo} />
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({
      query: GET_PAGES,
      variables: {
        filter: { published: true, featuredOnly: false, includeHomepage: true },
      },
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
