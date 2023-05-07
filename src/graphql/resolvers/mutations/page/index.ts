import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { Context } from '~/graphql/context'
import {
  MutationAddPageArgs,
  MutationDeletePageArgs,
  MutationEditPageArgs,
  PageAccess,
} from '~/graphql/types.generated'
import { extractFeatureImage } from '~/lib/compat/data'
import { graphcdn } from '~/lib/graphcdn'

export async function editPage(_, args: MutationEditPageArgs, ctx: Context) {
  const { id, data } = args
  const {
    title = '',
    text = '',
    data: blocks = '{}',
    path = '',
    slug = '',
    excerpt = '',
    published = undefined,
    featured = false,
    access = PageAccess.Public,
  } = data
  const { prisma, site } = ctx

  const existing = await prisma.page.findUnique({
    where: { slug_siteId: { slug, siteId: site.id } },
  })
  if (existing?.id !== id)
    throw new GraphQLError('Slug already exists', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  let featureImage = existing.featureImage
  if (!featureImage) {
    featureImage = extractFeatureImage(text, blocks)
  }

  if (path === '/' && published) {
    // new homepage is being published
    // unpublish the old homepage
    await prisma.page.updateMany({
      where: {
        siteId: site.id,
        path: '/',
        publishedAt: { not: null },
      },
      data: {
        publishedAt: null,
      },
    })
  }

  let publishedAt = data.publishedAt || existing.publishedAt
  if (!existing.publishedAt && published === true) {
    // newly published
    publishedAt = data.publishedAt || new Date()
  } else if (existing.publishedAt && published === false) {
    // unpublished
    publishedAt = null
  }

  return await prisma.page
    .update({
      where: { id },
      data: {
        title,
        featureImage,
        text,
        data: blocks,
        path: path || `/pages/${slug}`,
        slug,
        excerpt,
        featured,
        publishedAt: publishedAt,
        access: access || PageAccess.Public,
      },
    })
    .then((page) => {
      if (page.publishedAt) graphcdn.purgeList('pages')
      return page
    })
    .catch((err) => {
      console.error({ err })
      throw new GraphQLError('Unable to edit page', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })
}

export async function addPage(_, args: MutationAddPageArgs, ctx: Context) {
  const { data } = args
  const {
    title,
    text,
    data: blocks,
    path,
    slug,
    excerpt = '',
    featured = false,
    access = PageAccess.Public,
  } = data
  const { prisma, viewer, site } = ctx

  return await prisma.page
    .create({
      data: {
        title,
        featureImage: extractFeatureImage(text, blocks),
        text,
        data: blocks,
        path: path || `/pages/${slug}`,
        slug,
        excerpt,
        featured,
        access: access || PageAccess.Public,
        author: {
          connect: { id: viewer.id },
        },
        site: {
          connect: { id: site.id },
        },
      },
    })
    .then((page) => {
      graphcdn.purgeList('pages')
      return page
    })
    .catch((err) => {
      console.error({ err })
      throw new GraphQLError('Unable to add page', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })
}

export async function deletePage(
  _,
  args: MutationDeletePageArgs,
  ctx: Context
) {
  const { id } = args
  const { prisma } = ctx

  return await prisma.page.delete({
    where: { id },
  })
}
