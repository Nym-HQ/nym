import { Feed } from 'feed'

import routes from '~/config/routes'
import { Context } from '~/graphql/context'

import { getSiteDomain } from '../multitenancy/client'

export async function generateRSS(posts, context: Context) {
  const baseUrl = `https://${getSiteDomain(context.site)}`

  const date = new Date()
  const updated = new Date(posts[0].publishedAt)
  const author = {
    name: context.site.name,
    email: context.owner.email,
    link: baseUrl,
  }

  const feed = new Feed({
    title: routes.writing.seo.title,
    description: routes.writing.seo.description,
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: `${baseUrl}/static/meta/icon-512.png`,
    favicon: `${baseUrl}/static/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, NymHQ.com`,
    updated,
    feedLinks: {
      rss2: `${baseUrl}/writing/rss`,
      json: `${baseUrl}/writing/feed`,
      atom: `${baseUrl}/writing/atom`,
    },
    author,
  })

  posts.forEach((post) => {
    const url = `${baseUrl}/writing/${post.slug}`
    const postAuthor = {
      name: post.author.name,
      email: post.author.email,
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
