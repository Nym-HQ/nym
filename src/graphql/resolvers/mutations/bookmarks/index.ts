import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { Context } from '~/graphql/context'
import {
  MutationAddBookmarkArgs,
  MutationDeleteBookmarkArgs,
  MutationEditBookmarkArgs,
} from '~/graphql/types.generated'
import { graphcdn } from '~/lib/graphcdn'
import { getTweetCardHtml } from '~/lib/tweet/getTweetCardHtml'
import { getTwitterId } from '~/lib/tweet/parser'
import { validUrl } from '~/lib/validators'

import getUrlMetaData from '../../../../lib/scraper/getUrlMetaData'

export async function editBookmark(
  _,
  args: MutationEditBookmarkArgs,
  ctx: Context
) {
  const { id, data } = args
  const { title, description, tag, faviconUrl, tags } = data
  const { prisma, site } = ctx

  if (!title || title.length === 0)
    throw new GraphQLError('Bookmark must have a title', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  // reset tags
  await prisma.bookmark.update({
    where: { id },
    data: {
      tags: {
        set: [],
      },
    },
    include: { tags: true },
  })

  return await prisma.bookmark
    .update({
      where: { id },
      data: {
        title,
        description,
        faviconUrl,
        tags: {
          connectOrCreate: (tags || (tag ? [tag] : [])).map((tag) => ({
            where: {
              name_siteId: { name: tag.toLocaleLowerCase(), siteId: site.id },
            },
            create: { name: tag.toLocaleLowerCase(), siteId: site.id },
          })),
        },
      },
      include: { tags: true },
    })
    .then((bookmark) => {
      graphcdn.purgeList('bookmarks')
      return bookmark
    })
    .catch((err) => {
      console.error('Failed to edit bookmark', err)
      throw new GraphQLError('Unable to edit bookmark', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })
}

export async function addBookmark(
  _,
  args: MutationAddBookmarkArgs,
  ctx: Context
) {
  const { data } = args
  const { url, tag, tags } = data
  const { prisma, site } = ctx

  if (!validUrl(url))
    throw new GraphQLError('URL was invalid', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  let metadata,
    html = null
  try {
    if (getTwitterId(url)) {
      const tweet = await getTweetCardHtml(url)
      html = tweet.html
      metadata = tweet.meta
      metadata.title =
        metadata.title || `Tweet from ${metadata.name || metadata.screen_name}`
    } else {
      metadata = await getUrlMetaData(url)
    }
  } catch (err) {
    console.error('Unable to get metadata for bookmark: ' + url, { err })
    metadata = {
      host: '',
      title: '',
      image: null,
      description: '',
      faviconUrl: null,
    }
  }

  const {
    host,
    title,
    image,
    description,
    faviconUrl,
    html: content,
  } = metadata

  // TODO: publish to newsletter
  console.log('Adding bookmark to newsletter', { url })

  return await prisma.bookmark
    .create({
      data: {
        url,
        host,
        title,
        image,
        description,
        html,
        faviconUrl,
        content,
        tags: {
          connectOrCreate: (tags || (tag ? [tag] : [])).map((tag) => ({
            where: {
              name_siteId: { name: tag.toLocaleLowerCase(), siteId: site.id },
            },
            create: { name: tag.toLocaleLowerCase(), siteId: site.id },
          })),
        },
        site: {
          connect: { id: site.id },
        },
      },
      include: { tags: true },
    })
    .then((bookmark) => {
      graphcdn.purgeList('bookmarks')
      return bookmark
    })
    .catch((err) => {
      if (err.code === 'P2002') {
        throw new GraphQLError(
          'You already have a bookmark with the same URL.',
          {
            extensions: {
              code: ApolloServerErrorCode.BAD_REQUEST,
            },
          }
        )
      } else {
        console.error('Failed to create bookmark', err)
        console.error('Failed bookmark metadata', metadata)
        throw new GraphQLError('Unable to create bookmark', {
          extensions: {
            code: ApolloServerErrorCode.BAD_REQUEST,
          },
        })
      }
    })
}

export async function deleteBookmark(
  _,
  args: MutationDeleteBookmarkArgs,
  ctx: Context
) {
  const { id } = args
  const { prisma } = ctx

  return await prisma.bookmark
    .delete({
      where: { id },
    })
    .then(() => {
      graphcdn.purgeList('bookmarks')
      return true
    })
    .catch((err) => {
      console.error({ err })
      throw new GraphQLError('Unable to delete bookmark', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })
}
