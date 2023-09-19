import { Feed } from 'feed'

import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { Context } from '~/graphql/context'

import { getSiteDomain } from '../multitenancy/client'

export async function generateRSS(context: Context) {
  const baseUrl = `https://${getSiteDomain(context.site)}`

  const { prisma } = context

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      siteId: context.site.id,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      tags: true,
      _count: {
        select: { reactions: true },
      },
    },
  })

  console.log(`Generating feeds of ${bookmarks.length} bookmarks`)

  const date = new Date()
  const author = {
    name: context.owner.name,
    email: context.owner.email,
    link: baseUrl,
  }
  const seo = extendSEO(routes.bookmarks.seo, context.site)
  let updated = bookmarks
    ?.filter((b) => b.updatedAt || b.createdAt)
    .map((b) => new Date(b.updatedAt || b.createdAt))
    .sort((a, b) => b.getTime() - a.getTime())[0]
  updated = updated ? updated : new Date(0)

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

  bookmarks?.forEach((bookmark) => {
    feed.addItem({
      id: bookmark.id,
      title: bookmark.title || '',
      link: bookmark.url,
      description: bookmark.description,
      date: new Date(bookmark.updatedAt || bookmark.createdAt || 0),
      content: null,
      image: bookmark.image,
      author: [author],
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
