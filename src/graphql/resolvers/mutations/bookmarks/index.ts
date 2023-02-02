import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { IS_PROD } from '~/graphql/constants'
import { Context } from '~/graphql/context'
import {
  MutationAddBookmarkArgs,
  MutationDeleteBookmarkArgs,
  MutationEditBookmarkArgs,
} from '~/graphql/types.generated'
import { graphcdn } from '~/lib/graphcdn'
import { revue } from '~/lib/newsletter/providers/revue'
import { validUrl } from '~/lib/validators'

import getBookmarkMetaData from './getBookmarkMetaData'

export async function editBookmark(
  _,
  args: MutationEditBookmarkArgs,
  ctx: Context
) {
  const { id, data } = args
  const { title, description, tag, faviconUrl } = data
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
          connectOrCreate: {
            where: { name_siteId: { name: tag, siteId: site.id } },
            create: { name: tag, siteId: site.id },
          },
        },
      },
      include: { tags: true },
    })
    .then((bookmark) => {
      graphcdn.purgeList('bookmarks')
      return bookmark
    })
    .catch((err) => {
      console.error({ err })
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
  const { url, tag } = data
  const { prisma, site } = ctx

  if (!validUrl(url))
    throw new GraphQLError('URL was invalid', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  let metadata
  try {
    metadata = await getBookmarkMetaData(url)
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
  const { host, title, image, description, faviconUrl } = metadata

  /*
    Preemptively add bookmarks to Revue, assuming I want to share them
    more broadly in the newsletter
  */
  if (IS_PROD) {
    try {
      const { id } = await revue.getCurrentIssue()
      await revue.addItemToIssue({ id, url })
    } catch (err) {
      console.error({ err })
    }
  } else {
    console.log('Adding bookmark to newsletter', { url })
  }

  return await prisma.bookmark
    .create({
      data: {
        url,
        host,
        title,
        image,
        description,
        faviconUrl,
        tags:
          tag !== null
            ? {
                connectOrCreate: {
                  where: { name_siteId: { name: tag, siteId: site.id } },
                  create: {
                    name: tag.toLocaleLowerCase(),
                    siteId: site.id,
                  },
                },
              }
            : undefined,
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
      console.error({ err })
      throw new GraphQLError('Unable to create bookmark', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
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
