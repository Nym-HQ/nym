import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { PageEditor } from '~/components/Page/Editor/PageEditor'
import { getContext } from '~/graphql/context'
import { GET_PAGE } from '~/graphql/queries/pages'
import { useViewerQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function EditPagePage(props) {
  const { slug } = props
  const { data } = useViewerQuery()
  if (!data?.viewer?.isViewerSiteAdmin) return <Detail.Null type="404" />
  return <PageEditor slug={slug} />
}

export async function getServerSideProps(ctx) {
  const {
    params: { slug },
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
      query: GET_PAGE,
      variables: { slug },
    }),
  ])

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
