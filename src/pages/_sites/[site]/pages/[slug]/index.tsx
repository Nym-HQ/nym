import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { PageDetail } from '~/components/Page/PageDetail'
import { PagesList } from '~/components/Page/PagesList'
import { getContext } from '~/graphql/context'
import { GET_PAGE } from '~/graphql/queries/pages'
import { useContextQuery, useGetPageQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { parsePageData } from '~/lib/compat/data'

function SinglePageViewPage(props) {
  const { slug } = props
  const { data, error, loading } = useGetPageQuery({ variables: { slug } })
  const { data: context } = useContextQuery({ variables: {} })
  const page = parsePageData(props.page)

  console.log(page)

  return (
    <PageDetail
      slug={slug}
      site={context.context.site}
      page={page}
      error={null}
      loading={loading}
    />
  )
}

export async function getServerSideProps(ctx) {
  const {
    params: { slug },
  } = ctx

  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  const { data, loading } = await apolloClient.query({
    query: GET_PAGE,
    variables: { slug },
  })

  // page is found, but found by id, not by slug
  if (data.page && data.page.slug !== slug && data.page.path !== slug)
    return {
      redirect: {
        destination: data.page.path || `/pages/${data.page.slug}`,
        permanent: true,
      },
    }

  const graphqlData = await Promise.all(getCommonQueries(apolloClient))
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
      slug,
      ...commonProps,
      page: data?.page,
    },
  })
}

SinglePageViewPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={<PagesList />} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default SinglePageViewPage
