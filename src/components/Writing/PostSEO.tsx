import { NextSeo } from 'next-seo'
import * as React from 'react'

import { baseUrl } from '~/config/seo'
import { Post, Site } from '~/graphql/types.generated'

interface Props {
  post: Post
  site?: Site
}

export function PostSEO({ post, site }: Props) {
  const title = `${site?.name || 'Nym'} | ${post.title}`
  const description = `${site?.description || ''} | ${post.excerpt}`
  const imgUrl =
    site?.logo ||
    post.featureImage ||
    `${baseUrl}/static/img/writing/${post.slug}.png`

  return (
    <NextSeo
      title={title}
      description={description}
      openGraph={{
        title: title,
        url: `${baseUrl}/writing/${post.slug}`,
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
