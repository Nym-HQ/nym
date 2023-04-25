import * as React from 'react'

import AddBookmarkSiteList from '~/components/Bookmarks/AddBookmarkSiteList'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { GET_USER_SITES } from '~/graphql/queries/site'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function BookmarksPage(props) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.bookmarks.seo, context.context.site)

  return (
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
  )
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  let graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({ query: GET_USER_SITES }),
  ])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  return addApolloState(apolloClient, {
    props: {
      ...commonProps,
    },
  })
}

export default BookmarksPage
