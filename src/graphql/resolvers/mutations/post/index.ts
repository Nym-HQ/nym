import { UserInputError } from 'apollo-server-errors'

import { Context } from '~/graphql/context'
import {
  MutationAddPostArgs,
  MutationDeletePostArgs,
  MutationEditPostArgs,
} from '~/graphql/types.generated'
import { graphcdn } from '~/lib/graphcdn'

export async function editPost(_, args: MutationEditPostArgs, ctx: Context) {
  const { id, data } = args
  const {
    title = '',
    text = '',
    slug = '',
    excerpt = '',
    published = undefined,
  } = data
  const { prisma, site } = ctx

  const existing = await prisma.post.findUnique({ where: { id } })

  if (!existing || existing.siteId !== site.id)
    throw new UserInputError('Post not found!')

  const checkDup = await prisma.post.findUnique({
    where: { slug_siteId: { slug, siteId: site.id } },
  })
  if (checkDup && checkDup.id !== id)
    throw new UserInputError('Slug already exists')

  let publishedAt = data.publishedAt || existing.publishedAt
  if (!existing.publishedAt && published === true) {
    // newly published
    publishedAt = data.publishedAt || new Date()
  } else if (existing.publishedAt && published === false) {
    // unpublished
    publishedAt = null
  }

  return await prisma.post
    .update({
      where: { id },
      data: {
        title,
        text,
        slug,
        excerpt,
        publishedAt: publishedAt,
      },
    })
    .then((post) => {
      if (post.publishedAt) graphcdn.purgeList('posts')
      return post
    })
    .catch((err) => {
      console.error({ err })
      throw new UserInputError('Unable to edit post')
    })
}

export async function addPost(_, args: MutationAddPostArgs, ctx: Context) {
  const { data } = args
  const { title, text, slug, excerpt = '' } = data
  const { prisma, viewer, site } = ctx

  return await prisma.post
    .create({
      data: {
        title,
        text,
        slug,
        excerpt,
        author: {
          connect: { id: viewer.id },
        },
        site: {
          connect: { id: site.id },
        },
      },
    })
    .then((post) => {
      graphcdn.purgeList('posts')
      return post
    })
    .catch((err) => {
      console.error({ err })
      throw new UserInputError('Unable to add post')
    })
}

export async function deletePost(
  _,
  args: MutationDeletePostArgs,
  ctx: Context
) {
  const { id } = args
  const { prisma } = ctx

  return await prisma.post.delete({
    where: { id },
  })
}
