import { Feed } from 'feed'

import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { NYM_APP_SITE } from '~/graphql/constants'
import { Context } from '~/graphql/context'
import { GET_POSTS } from '~/graphql/queries/posts'

import { initApolloClient } from '../apollo'
import { getSiteDomain } from '../multitenancy/client'
import { fixXmlEntities } from './helpers'

export async function generateRSS(context: Context) {
  const baseUrl = `https://${getSiteDomain(context.site)}`

  const apolloClient = initApolloClient({ context })
  const {
    data: { posts },
  } = await apolloClient.query({
    query: GET_POSTS,
    variables: { filter: { published: true } },
  })

  console.log(`Generating feeds of ${posts.length} posts`)
  const owner =
    context.site.id === NYM_APP_SITE.id
      ? { name: 'Nym', email: 'support@nymhq.com' }
      : context.owner

  const date = new Date()
  const author = {
    name: owner.name,
    email: owner.email,
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
      image: post.featureImage ? fixXmlEntities(post.featureImage) : null,
      // content: post.data,
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
