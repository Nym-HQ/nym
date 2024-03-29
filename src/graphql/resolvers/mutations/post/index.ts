import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { Context } from '~/graphql/context'
import {
  MutationAddPostArgs,
  MutationDeletePostArgs,
  MutationEditPostArgs,
  PostAccess,
} from '~/graphql/types.generated'
import { extractFeatureImage, parseEditorJsData } from '~/lib/compat/data'
import { parseEditorJsDataIntoHtml } from '~/lib/editorjs/htmlParser'
import { graphcdn } from '~/lib/graphcdn'
import { getNewsletterProvider } from '~/lib/newsletter'

export async function editPost(_, args: MutationEditPostArgs, ctx: Context) {
  const { id, data } = args
  const {
    title = '',
    text = '',
    data: blocks = '{}',
    slug = '',
    excerpt = '',
    published = undefined,
    access = PostAccess.Public,
  } = data
  const { prisma, site } = ctx

  const existing = await prisma.post.findUnique({ where: { id } })

  if (!existing || existing.siteId !== site.id)
    throw new GraphQLError('Post not found!', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  let featureImage = existing.featureImage
  if (!featureImage) {
    featureImage = extractFeatureImage(text, blocks)
  }

  const checkDup = await prisma.post.findUnique({
    where: { slug_siteId: { slug, siteId: site.id } },
  })
  if (checkDup && checkDup.id !== id)
    throw new GraphQLError('Slug already exists', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })

  let publishedAt = data.publishedAt || existing.publishedAt
  if (!existing.publishedAt && published === true) {
    // newly published
    publishedAt = data.publishedAt || new Date()
  } else if (existing.publishedAt && published === false) {
    // unpublished
    publishedAt = null
  }

  const result = await prisma.post
    .update({
      where: { id },
      data: {
        title,
        featureImage,
        text,
        data: blocks,
        slug,
        excerpt,
        publishedAt,
        access: access || PostAccess.Public,
      },
    })
    .then((post) => {
      if (post.publishedAt) graphcdn.purgeList('posts')
      return post
    })
    .catch((err) => {
      console.error({ err })
      throw new GraphQLError('Unable to edit post', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
    })

  if (!existing.newsletterAt && publishedAt && data.publishNewsletter) {
    try {
      const html =
        `<h1>${existing.title}</h1><br/>` +
        parseEditorJsDataIntoHtml(parseEditorJsData(data.data))

      const newsletterProvider = await getNewsletterProvider(ctx)
      if (newsletterProvider) {
        const sent = await newsletterProvider.send({
          subject: data.title,
          htmlBody: html,
          textBody: null,
        })

        // TODO: handle error
        // if (!sent) {
        //   throw new Error('Unable to send newsletter')
        // }
        await prisma.post.update({
          where: { id },
          data: {
            newsletterAt: new Date(),
          },
        })
      } else {
        console.info('Newsletter Providers are not configured')
      }
    } catch (err) {
      console.error('Unable to publish newsletter', err)
      throw new GraphQLError('Unable to publish newsletter', {
        extensions: {
          code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        },
      })
    }
  }

  return result
}

export async function addPost(_, args: MutationAddPostArgs, ctx: Context) {
  const { data } = args
  const {
    title,
    text,
    data: blocks,
    slug,
    excerpt = '',
    access = PostAccess.Public,
  } = data
  const { prisma, viewer, site, isApiViewer } = ctx

  let publishedAt = null
  if (isApiViewer && data.published) {
    publishedAt = new Date()
  }

  return await prisma.post
    .create({
      data: {
        title,
        featureImage: extractFeatureImage(text, blocks),
        text,
        data: blocks,
        slug,
        excerpt,
        access: access || PostAccess.Public,
        publishedAt,
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
      throw new GraphQLError('Unable to add post', {
        extensions: {
          code: ApolloServerErrorCode.BAD_REQUEST,
        },
      })
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
