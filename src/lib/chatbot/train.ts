import { Context } from '@apollo/client'
import { PineconeClient } from '@pinecone-database/pinecone'
import { PostAccess } from '@prisma/client'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

import parseEditorJsDataIntoMarkdown from '../editorjs/markdownParser'

// import getTwitterTimeline from '../tweet/getTwitterTimeline'

export function getIndexName(context: Context) {
  return `nym-${context.site?.id}`
}

/**
 * Get training data
 * @param context
 * @returns
 */
export async function getTrainData(context: Context) {
  // return (await getTwitterTimeline(context)).map((e) => {
  //   return { pageContent: e.text, metadata: { id: e.id } } as Document
  // })
  const { prisma, site } = context
  const publishedPosts = await prisma.post.findMany({
    where: {
      siteId: site.id,
      publishedAt: { not: null, lt: new Date() },
      access: { equals: PostAccess.PUBLIC },
    },
  })

  return publishedPosts.map((p) => {
    if (!p.data) return null

    let data = p.data
    if (typeof p.data === 'string') {
      data = JSON.parse(p.data)
    }

    return {
      pageContent: parseEditorJsDataIntoMarkdown(p.data),
      metadata: { id: p.id },
    } as Document
  })
}

/**
 * Look up existing trained index
 */
export async function getTrainedIndex(context: Context) {
  const client = new PineconeClient()
  client.init({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
  })

  const indexName = getIndexName(context)
  const indexes = await client.listIndexes()

  let pineconeIndex
  if (indexes.includes(indexName)) {
    pineconeIndex = await client.Index(indexName)

    return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
      pineconeIndex,
    })
  }
  return null
}

/**
 * Create a new index
 */
export async function createIndex(context: Context, docs) {
  const client = new PineconeClient()
  client.init({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
  })

  const indexName = getIndexName(context)

  let pineconeIndex

  console.log('Creating index')
  pineconeIndex = await client.createIndex({
    createRequest: {
      name: indexName,
      dimension: 512,
      metric: 'cosine',
      shards: 1,
    },
  })

  console.log('Initializing Store...')

  return await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    pineconeIndex,
  })
}
