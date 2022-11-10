import { UserInputError } from 'apollo-server-errors'

import { Context } from '~/graphql/context'
import {
  MutationAddPageArgs,
  MutationDeletePageArgs,
  MutationEditPageArgs,
} from '~/graphql/types.generated'
import { graphcdn } from '~/lib/graphcdn'

export async function editPage(_, args: MutationEditPageArgs, ctx: Context) {
  const { id, data } = args
  const {
    title = '',
    text = '',
    path = '',
    slug = '',
    excerpt = '',
    published = undefined,
    featured = false,
  } = data
  const { prisma, site } = ctx

  const existing = await prisma.page.findUnique({
    where: { slug_siteId: { slug, siteId: site.id } },
  })
  if (existing?.id !== id) throw new UserInputError('Slug already exists')

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

  let publishedAt = existing.publishedAt
  if (!existing.publishedAt && published === true) {
    // newly published
    publishedAt = new Date()
  } else if (existing.publishedAt && published === false) {
    // unpublished
    publishedAt = null
  }

  return await prisma.page
    .update({
      where: { id },
      data: {
        title,
        text,
        path: path || `/pages/${slug}`,
        slug,
        excerpt,
        featured,
        publishedAt: publishedAt,
      },
    })
    .then((page) => {
      if (page.publishedAt) graphcdn.purgeList('pages')
      return page
    })
    .catch((err) => {
      console.error({ err })
      throw new UserInputError('Unable to edit page')
    })
}

export async function addPage(_, args: MutationAddPageArgs, ctx: Context) {
  const { data } = args
  const { title, text, path, slug, excerpt = '', featured = false } = data
  const { prisma, viewer, site } = ctx

  return await prisma.page
    .create({
      data: {
        title,
        text,
        path: path || `/pages/${slug}`,
        slug,
        excerpt,
        featured,
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
      throw new UserInputError('Unable to add page')
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
