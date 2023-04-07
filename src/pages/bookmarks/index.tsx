import { NextSeo } from 'next-seo'
import * as React from 'react'

import AddBookmarkSiteList from '~/components/Bookmarks/AddBookmarkSiteList'
import { BookmarksList } from '~/components/Bookmarks/BookmarksList'
import { ListDetailView } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
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
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.bookmarks.seo, context.context.site)

  return props.site.isAppDomain ? (
    <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
      <TitleBar
        magicTitle
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        title="Add Bookmark"
      />

      {/* Keep this div to trigger the magic scroll */}
      <div className="p-4" ref={titleRef} />

      <Detail.ContentContainer>
        <div className="flex flex-col items-center justify-center space-y-12">
          <div className="w-96 mb-4">
            <AddBookmarkSiteList />
          </div>
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  ) : (
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

  if (commonProps.site.isAppDomain) {
    //
  } else if (!commonProps.site.siteId) {
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
