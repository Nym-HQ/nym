import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { PostEditor } from '~/components/Writing/Editor/PostEditor'
import { PostDetail } from '~/components/Writing/PostDetail'
import { PostsList } from '~/components/Writing/PostsList'
import { getContext } from '~/graphql/context'
import { GET_COMMENTS } from '~/graphql/queries/comments'
import { GET_POST, GET_POSTS } from '~/graphql/queries/posts'
import {
  CommentType,
  useContextQuery,
  useGetPostQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function WritingPostPage(props) {
  const { slug } = props
  const { data: context } = useContextQuery({ variables: {} })
  const { data, error, loading } = useGetPostQuery({ variables: { slug } })
  if (data?.post && !data.post.publishedAt)
    return (
      <PostEditor slug={slug} site={context.context.site} post={data.post} />
    )
  return (
    <PostDetail
      slug={slug}
      site={context.context.site}
      post={data.post}
      error={error}
      loading={loading}
    />
  )
}

export async function getInitialProps(ctx) {
  const {
    params: { slug },
  } = ctx

  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const { data } = await apolloClient.query({
    query: GET_POST,
    variables: { slug },
  })

  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({ query: GET_POSTS }),

    data?.post?.id &&
      apolloClient.query({
        query: GET_COMMENTS,
        variables: { refId: data.post.id, type: CommentType.Bookmark },
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

WritingPostPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={<PostsList />} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default WritingPostPage
