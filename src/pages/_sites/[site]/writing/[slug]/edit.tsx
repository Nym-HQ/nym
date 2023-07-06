import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { withProviders } from '~/components/Providers/withProviders'
import { PostEditor } from '~/components/Writing/Editor/PostEditor'
import { getContext } from '~/graphql/context'
import { GET_POST } from '~/graphql/queries/posts'
import { useContextQuery, useGetPostQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { parsePostData } from '~/lib/compat/data'

export const config = {
  runtime: 'nodejs',
}

function EditPostPage(props) {
  const { slug } = props
  const { data: context } = useContextQuery()
  const { data } = useGetPostQuery({ variables: { slug } })
  const post = parsePostData(data?.post)

  if (!context?.context?.viewer?.isAdmin) return <Detail.Null type="404" />
  return <PostEditor slug={slug} post={post} site={context.context?.site} />
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
      query: GET_POST,
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

EditPostPage.getLayout = withProviders(function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={null} hasDetail detail={page} />
    </SiteLayout>
  )
})

export default EditPostPage
