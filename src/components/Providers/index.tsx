import { ApolloProvider } from '@apollo/client'
import { NextPageContext } from 'next'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import * as React from 'react'

import { TooltipProvider } from '~/components/chat/ui/tooltip'
import { useApollo } from '~/lib/apollo'

import { AddBookmarkDialog, SubscribeDialog } from '../Dialog'
// import { FathomProvider } from './Fathom'
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
    <NextThemesProvider>
      <ApolloProvider client={apolloClient}>
        <GlobalSiteContextProvider pageProps={pageProps}>
          <SEO />
          {/* <FathomProvider /> */}

          <GlobalNavigationContextProvider pageProps={pageProps}>
            <TooltipProvider>
              {children}
              <SubscribeDialog />
              <AddBookmarkDialog />
            </TooltipProvider>
          </GlobalNavigationContextProvider>
        </GlobalSiteContextProvider>
      </ApolloProvider>
    </NextThemesProvider>
  )
}
