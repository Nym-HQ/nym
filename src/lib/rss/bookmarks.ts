import { Feed } from 'feed'

import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { Context } from '~/graphql/context'
import { BookmarkEdge } from '~/graphql/types.generated'

import { getSiteDomain } from '../multitenancy/client'

export async function generateRSS(bookmarks: BookmarkEdge[], context: Context) {
  const baseUrl = `https://${getSiteDomain(context.site)}`

  const date = new Date()
  const author = {
    name: context.owner.name,
    email: context.owner.email,
    link: baseUrl,
  }
  const seo = extendSEO(routes.bookmarks.seo, context.site)
  const updated =
    bookmarks?.length > 0
      ? bookmarks
          .map((b) => b.node)
          .filter((b) => b.updatedAt || b.createdAt)
          .map((b) => new Date(b.updatedAt || b.createdAt))
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
      rss2: `${baseUrl}/bookmarks/rss`,
      json: `${baseUrl}/bookmarks/feed`,
      atom: `${baseUrl}/bookmarks/atom`,
    },
    author,
  })

  bookmarks
    ?.map((b) => b.node)
    .forEach((bookmark) => {
      feed.addItem({
        title: bookmark.title,
        id: bookmark.url,
        link: bookmark.url,
        description: bookmark.description,
        date: new Date(bookmark.updatedAt || bookmark.createdAt || 0),
        content: bookmark.html || bookmark.content,
        image: bookmark.image,
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
