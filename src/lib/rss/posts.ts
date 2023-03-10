import { Feed } from 'feed'

import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { Context } from '~/graphql/context'
import { Post } from '~/graphql/types.generated'

import { getSiteDomain } from '../multitenancy/client'

export async function generateRSS(posts: Post[], context: Context) {
  const baseUrl = `https://${getSiteDomain(context.site)}`

  const date = new Date()
  const author = {
    name: context.owner.name,
    email: context.owner.email,
    link: baseUrl,
  }
  const seo = extendSEO(routes.writing.seo, context.site)
  const updated =
    posts?.length > 0
      ? posts
          .filter((p) => p.publishedAt)
          .map((p) => new Date(p.publishedAt))
          .sort((a, b) => b.getTime() - a.getTime())[0]
      : new Date(0)

  const feed = new Feed({
    title: seo.title,
    description: seo.description,
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: `${baseUrl}/static/meta/icon-512.png`,
    favicon: `${baseUrl}/static/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, ${
      context.site.name
    }`,
    updated,
    feedLinks: {
      rss2: `${baseUrl}/writing/rss`,
      json: `${baseUrl}/writing/feed`,
      atom: `${baseUrl}/writing/atom`,
    },
    author,
  })

  posts?.forEach((post) => {
    const url = `${baseUrl}/writing/${post.slug}`
    const postAuthor = {
      name: post.author?.name,
      email: post.author?.email,
    }
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.excerpt,
      author: [postAuthor],
      contributor: [postAuthor],
      date: new Date(post.publishedAt),
    })
  })

  const rss = feed.rss2()
  const atom = feed.atom1()
  const json = feed.json1()

  return {
    rss,
    atom,
    json,
  }
}
