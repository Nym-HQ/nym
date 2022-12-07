import { NextSeo } from 'next-seo'
import * as React from 'react'

import { baseUrl } from '~/config/seo'
import { Page, Site } from '~/graphql/types.generated'

interface Props {
  page: Page
  site?: Site
}

export function PageSEO({ page, site }: Props) {
  const title = `${site?.name || 'Nym'} | ${page.title}`
  const description = `${site?.description || ''} | ${page.excerpt}`
  const imgUrl =
    site?.logo ||
    page.featureImage ||
    `${baseUrl}/static/img/writing/${page.slug}.png`

  return (
    <NextSeo
      title={title}
      description={description}
      openGraph={{
        title: title,
        url: `${baseUrl}/pages/${page.slug}`,
        description: description,
        images: [
          {
            url: imgUrl,
            alt: title,
          },
        ],
      }}
      twitter={{
        cardType: 'summary_large_image',
      }}
    />
  )
}
