import { GetServerSideProps } from 'next/types'
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
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

function AddBookmarkPage(props) {
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.bookmarks.seo, context.context.site)

  React.useEffect(() => {
    const url = new URL(window.location.href)

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('custom.action.openAddBookmarkForm', {
          detail: { url: url.searchParams.get('url') },
        })
      )
    })
  }, [])

  return <NextSeo {...seo} />
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)
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

AddBookmarkPage.getLayout = function getLayout(page) {
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

export default AddBookmarkPage
