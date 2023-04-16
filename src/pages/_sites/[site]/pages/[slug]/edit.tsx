import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { PageEditor } from '~/components/Page/Editor/PageEditor'
import { getContext } from '~/graphql/context'
import { GET_PAGE } from '~/graphql/queries/pages'
import { useContextQuery, useGetPageQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { parsePageData } from '~/lib/compat/data'

function EditPagePage(props) {
  const { slug } = props
  const { data: context } = useContextQuery()
  const { data } = useGetPageQuery({ variables: { slug } })
  const page = parsePageData(data?.page)

  if (!context?.context?.viewer?.isAdmin) return <Detail.Null type="404" />
  return <PageEditor slug={slug} page={page} site={context.context?.site} />
}

export async function getServerSideProps(ctx) {
  const {
    params: { slug },
  } = ctx

  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({
      query: GET_PAGE,
      variables: { slug },
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
    props: { slug, ...commonProps },
  })
}

EditPagePage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={null} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default EditPagePage
