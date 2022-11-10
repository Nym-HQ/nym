import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { PageEditor } from '~/components/Page/Editor/PageEditor'
import { getContext } from '~/graphql/context'
import { useViewerQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function NewPagePage(props) {
  const { data } = useViewerQuery()
  if (!data?.viewer?.isViewerSiteAdmin) return <Detail.Null type="404" />
  return <PageEditor />
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

  await Promise.all([...getCommonQueries(apolloClient)])

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}

NewPagePage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={null} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default NewPagePage
