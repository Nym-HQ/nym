import { GetServerSideProps } from 'next/types'
import * as React from 'react'

import { ListDetailView } from '~/components/Layouts'
import { SignIn } from '~/components/SignIn'
import { getContext } from '~/graphql/context'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

export default function SignInPage(props) {
  return <ListDetailView list={null} hasDetail detail={<SignIn />} />
}

/**
 * This page will always be accessed from App domain, see middleware
 *
 * @param props
 * @returns
 */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx

  const url = new URL(req.url, `https://${req.headers.host}`)
  const searchParams = new URLSearchParams(url.search)
  const _nextUrl = new URL(searchParams.get('next') || '/', url)

  // check if user has already signed-in, and if he did, process cross-signin automatically
  const context = await getContext(ctx, prisma)
  if (context.viewer) {
    let nextUrl: URL
    if (_nextUrl.host != MAIN_APP_DOMAIN) {
      nextUrl = new URL(
        `/signin-complete?next=${encodeURIComponent(_nextUrl.toString())}`,
        `${url.protocol}//${req.headers.host}`
      )
    } else if (_nextUrl.pathname != '/login') {
      nextUrl = _nextUrl
    } else {
      nextUrl = new URL('/', _nextUrl)
    }

    res.writeHead(302, { Location: nextUrl.toString() })
    res.end()
    return { props: {} }
  }

  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}
