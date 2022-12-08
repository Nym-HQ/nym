import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { PageEditor } from '~/components/Page/Editor/PageEditor'
import { PageDetail } from '~/components/Page/PageDetail'
import { PagesList } from '~/components/Page/PagesList'
import { getContext } from '~/graphql/context'
import { GET_COMMENTS } from '~/graphql/queries/comments'
import { GET_PAGE, GET_PAGES } from '~/graphql/queries/pages'
import {
  CommentType,
  useContextQuery,
  useGetPageQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function PagePagePage(props) {
  const { slug } = props
  const { data: context } = useContextQuery({ variables: {} })
  const { data, error, loading } = useGetPageQuery({ variables: { slug } })
  if (data?.page && !data.page.publishedAt)
    return (
      <PageEditor slug={slug} site={context.context.site} page={data.page} />
    )

  return (
    <PageDetail
      slug={slug}
      site={context.context.site}
      page={data.page}
      error={error}
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

  const { data } = await apolloClient.query({
    query: GET_PAGE,
    variables: { slug },
  })

  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({ query: GET_PAGES }),

    data?.page?.id &&
      apolloClient.query({
        query: GET_COMMENTS,
        variables: { refId: data.page.id, type: CommentType.Bookmark },
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
    props: {
      slug,
      ...commonProps,
    },
  })
}

PagePagePage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={<PagesList />} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default PagePagePage
