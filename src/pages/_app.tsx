import '~/styles/custom-styles.css'
import '~/styles/dracula.css'
import '~/styles/prose-styles.css'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import '~/styles/react-md-editor.css'
import '~/styles/editor-js.css'

import { Analytics } from '@vercel/analytics/react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { SessionProvider } from 'next-auth/react'
import React, { useEffect } from 'react'

import { SiteLayout } from '~/components/Layouts'
import { LoginErrorToast } from '~/components/LoginErrorToast'
import { Providers } from '~/components/Providers'
import { Toast } from '~/components/Providers/Toaster'
// import * as bee from '~/lib/bee'
import * as gtag from '~/lib/gtag'

export default function App({ Component, session, pageProps }) {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
      // bee.track('Page View', {
      //   site_id: pageProps?.site?.id,
      //   subdomain: pageProps?.site?.subdomain,
      //   url: url,
      // })
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const getLayout = (page) => (
    <>
      {
        /* Global Site Tag (gtag.js) - Google Analytics */
        gtag.GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtag.GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )
      }
      {
        /**
         * Splitbee Tracker
         * https://splitbee.io/docs/embed-the-script
         */
        // bee.SPLITBEE_TOKEN && (
        //   <Script
        //     async
        //     data-no-cookie
        //     data-token={bee.SPLITBEE_TOKEN}
        //     data-api="/_hive"
        //     src="/bee.js"
        //   />
        // )
      }

      <SessionProvider session={session}>
        <Providers pageProps={pageProps}>
          <Toast />
          <LoginErrorToast />
          {Component.getLayout ? (
            Component.getLayout(page)
          ) : (
            <SiteLayout>{page}</SiteLayout>
          )}
        </Providers>
      </SessionProvider>
      <Analytics />
    </>
  )

  return getLayout(<Component {...pageProps} />)
}
