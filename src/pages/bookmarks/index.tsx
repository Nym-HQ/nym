import { NextSeo } from 'next-seo'
import * as React from 'react'

import { BookmarksList } from '~/components/Bookmarks/BookmarksList'
import { ListDetailView, SiteLayout } from '~/components/Layouts'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { GET_BOOKMARKS } from '~/graphql/queries/bookmarks'
import { GET_TAGS } from '~/graphql/queries/tags'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function BookmarksPage(props) {
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.bookmarks.seo, context.context.site)

  return <NextSeo {...seo} />
}

export async function getInitialProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({ query: GET_BOOKMARKS }),
    apolloClient.query({ query: GET_TAGS }),
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
      ...commonProps,
    },
  })
}

BookmarksPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView
        list={<BookmarksList />}
        hasDetail={false}
        detail={page}
      />
    </SiteLayout>
  )
}

export default BookmarksPage
