import { NextSeo } from 'next-seo'
import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { PostsList } from '~/components/Writing/PostsList'
import routes from '~/config/routes'
import { getContext } from '~/graphql/context'
import { GET_POSTS } from '~/graphql/queries/posts'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function WritingPage(props) {
  return (
    <NextSeo
      title={routes.writing.seo.title}
      description={routes.writing.seo.description}
      openGraph={routes.writing.seo.openGraph}
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
      query: GET_POSTS,
      variables: { filter: { published: true } },
    }),
  ])

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}

WritingPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={<PostsList />} hasDetail={false} detail={page} />
    </SiteLayout>
  )
}

export default WritingPage
