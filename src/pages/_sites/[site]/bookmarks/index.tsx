import { NextSeo } from 'next-seo'
import * as React from 'react'

import { BookmarksList } from '~/components/Bookmarks/BookmarksList'
import { ListDetailView } from '~/components/Layouts'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { GET_BOOKMARKS } from '~/graphql/queries/bookmarks'
import { GET_TAGS } from '~/graphql/queries/tags'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

export const config = {
  runtime: 'nodejs',
}

function BookmarksPage(props) {
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.bookmarks.seo, context.context.site)

  return (
    <ListDetailView
      list={<BookmarksList />}
      hasDetail={false}
      detail={<NextSeo {...seo} />}
    />
  )
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  let graphqlData = await Promise.all(getCommonQueries(apolloClient))
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  if (!commonProps.site.siteId) {
    // Visited through subdomain, but the domain is not occupied yet.
    // Call-to-action to bu
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  } else {
    graphqlData = [
      ...graphqlData,

      ...(await Promise.all([
        apolloClient.query({ query: GET_BOOKMARKS }),
        apolloClient.query({ query: GET_TAGS }),
      ])),
    ]
  }

  return addApolloState(apolloClient, {
    props: {
      ...commonProps,
    },
  })
}

export default BookmarksPage
