import { Context } from '@apollo/client'
import { PineconeClient } from '@pinecone-database/pinecone'
import { PostAccess } from '@prisma/client'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

import parseEditorJsDataIntoMarkdown from '../editorjs/markdownParser'

// import getTwitterTimeline from '../tweet/getTwitterTimeline'

async function initPineconeClient() {
  // Create a client
  const client = new PineconeClient()

  // Initialize the client
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  })
  return client
}

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
      metadata: { id: p.id, siteId: site.id, type: 'writing' },
    } as Document
  })
}

/**
 * Look up existing trained index
 */
export async function getTrainedIndex(context: Context) {
  const client = await initPineconeClient()
  const indexName = getIndexName(context)
  const indexes = await client.listIndexes()
  console.log('Existing Pinecone Indexes:', indexes)

  if (!indexes.includes(indexName)) return null

  const pineconeIndex = client.Index(indexName)

  return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
    pineconeIndex,
  })
}

/**
 * Create a new index
 */
export async function createIndex(context: Context, docs) {
  const client = await initPineconeClient()
  const indexName = getIndexName(context)

  console.log('Creating index', indexName)
  await client.createIndex({
    createRequest: {
      name: indexName,
      dimension: 512,
      metric: 'cosine',
      shards: 1,
    },
  })
  const pineconeIndex = client.Index(indexName)

  console.log('Initializing Store...', indexName)
  return await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    pineconeIndex,
  })
}
