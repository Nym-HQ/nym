import * as React from 'react'

import { getContext } from '~/graphql/context'
import { GET_BOOKMARKS } from '~/graphql/queries/bookmarks'
import { initApolloClient } from '~/lib/apollo'
import { generateBookmarkRSS } from '~/lib/rss'

const AtomFeed: React.FC = () => null

export async function getServerSideProps(ctx) {
  const { req, res } = ctx
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const {
    data: { bookmarks },
  } = await apolloClient.query({
    query: GET_BOOKMARKS,
  })
  const { atom } = await generateBookmarkRSS(bookmarks?.edges || [], context)

  if (res) {
    res.setHeader('Content-Type', 'text/xml')
    res.write(atom)
    res.end()
  }

  return {
    props: {},
  }
}

export default AtomFeed
