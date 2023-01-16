import Head from 'next/head'
import { DefaultSeo } from 'next-seo'
import * as React from 'react'

import { baseUrl, extendSEO } from '~/config/seo'
import { useContextQuery } from '~/graphql/types.generated'

export function SEO() {
  const { data: context } = useContextQuery()
  const seo = extendSEO({}, context?.context?.site)
  const favicon =
    context?.context?.owner?.avatar ||
    context?.context?.owner?.image ||
    '/static/favicon.ico'

  return (
    <>
      <DefaultSeo {...seo} />
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <link rel="icon" href={favicon} sizes="any" />
        <link rel="icon" href={favicon} type="image/png" sizes="any" />
        <link rel="mask-icon" href="/static/meta/mask-icon.svg" />
        <link rel="apple-touch-icon" href="/static/meta/apple-touch-icon.png" />
        <link rel="manifest" href="/static/meta/manifest.webmanifest" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS feed"
          href={`${baseUrl}/writing/rss`}
        />
        <meta
          name="theme-color"
          content="#fff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="rgb(23, 23, 23)"
          media="(prefers-color-scheme: dark)"
        />
      </Head>
    </>
  )
}
