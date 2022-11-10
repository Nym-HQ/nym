import { NextSeo } from 'next-seo'
import * as React from 'react'

import { baseUrl } from '~/config/seo'
import { Page } from '~/graphql/types.generated'

interface Props {
  page: Page
}

export function PageSEO({ page }: Props) {
  return (
    <NextSeo
      title={page.title}
      description={page.excerpt}
      openGraph={{
        title: page.title,
        url: `${baseUrl}/pages/${page.slug}`,
        description: page.excerpt,
        images: [
          {
            url:
              page.featureImage ||
              `${baseUrl}/static/img/pages/${page.slug}.png`,
            alt: page.title,
          },
        ],
      }}
      twitter={{
        cardType: 'summary_large_image',
      }}
    />
  )
}
