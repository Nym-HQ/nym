import * as React from 'react'

import { BookmarkDetail } from '~/components/Bookmarks/BookmarkDetail'
import { BookmarksList } from '~/components/Bookmarks/BookmarksList'
import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { getContext } from '~/graphql/context'
import { GET_BOOKMARKS } from '~/graphql/queries/bookmarks'
import { GET_BOOKMARK } from '~/graphql/queries/bookmarks'
import { GET_COMMENTS } from '~/graphql/queries/comments'
import { GET_TAGS } from '~/graphql/queries/tags'
import {
  CommentType,
  useContextQuery,
  useGetBookmarkQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function BookmarkPage(props) {
  const { id } = props
  const { data: context } = useContextQuery()
  const { data, loading, error } = useGetBookmarkQuery({
    variables: { id },
  })

  return (
    <BookmarkDetail
      id={id}
      site={context.context.site}
      bookmark={data.bookmark}
      loading={loading}
      error={error}
    />
  )
}

export async function getInitialProps(ctx) {
  const {
    params: { id },
  } = ctx
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({ query: GET_BOOKMARKS }),
    apolloClient.query({ query: GET_TAGS }),
    apolloClient.query({
      query: GET_BOOKMARK,
      variables: { id },
    }),
    apolloClient.query({
      query: GET_COMMENTS,
      variables: { refId: id, type: CommentType.Bookmark },
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
      id,
      ...commonProps,
    },
  })
}

BookmarkPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={<BookmarksList />} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default BookmarkPage
