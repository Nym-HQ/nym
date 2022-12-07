import { NextSeo } from 'next-seo'
import * as React from 'react'

import { baseUrl, extendSEO } from '~/config/seo'
import { Post, Site } from '~/graphql/types.generated'

interface Props {
  post: Post
  site?: Site
}

export function PostSEO({ post, site }: Props) {
  const seo = extendSEO(
    {
      title: post.title,
      description: post.excerpt,
      image: post.featureImage,
    },
    site
  )

  return <NextSeo {...seo} />
}
