import { NextSeo } from 'next-seo'
import * as React from 'react'

import { extendSEO } from '~/config/seo'
import { Page, Site } from '~/graphql/types.generated'

interface Props {
  page: Page
  site?: Site
}

export function PageSEO({ page, site }: Props) {
  const seo = extendSEO(
    {
      title: page.title,
      description: page.excerpt,
      image: page.featureImage,
    },
    site
  )

  return <NextSeo {...seo} />
}
