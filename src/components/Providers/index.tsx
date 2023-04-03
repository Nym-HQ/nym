import { ApolloProvider } from '@apollo/client'
import { NextPageContext } from 'next'
import * as React from 'react'

import { useApollo } from '~/lib/apollo'

import { AddBookmarkDialog, SubscribeDialog } from '../Dialog'
import { FathomProvider } from './Fathom'
import { GlobalNavigationContextProvider } from './GlobalNavigation'
import { GlobalSiteContextProvider } from './GlobalSite'
import { SEO } from './SEO'

interface Props {
  children?: any
  pageProps: NextPageContext
}

export function Providers({ children, pageProps }: Props) {
  const apolloClient = useApollo(pageProps)

  return (
    <ApolloProvider client={apolloClient}>
      <GlobalSiteContextProvider pageProps={pageProps}>
        <SEO />
        <FathomProvider />

        <GlobalNavigationContextProvider pageProps={pageProps}>
          {children}
          <SubscribeDialog />
          <AddBookmarkDialog />
        </GlobalNavigationContextProvider>
      </GlobalSiteContextProvider>
    </ApolloProvider>
  )
}
