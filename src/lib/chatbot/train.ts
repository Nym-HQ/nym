import { Context } from '@apollo/client'
import { PineconeClient } from '@pinecone-database/pinecone'
import { PostAccess } from '@prisma/client'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
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

  const textSplitter = new CharacterTextSplitter({
    chunkSize: 2000,
    separator: '\n',
  })

  const ids = []
  const splitTexts = await Promise.all(
    publishedPosts.map(async (p) => {
      if (!p.data) return null

      let data = p.data
      if (typeof p.data === 'string') {
        data = JSON.parse(p.data)
      }

      const splits = await textSplitter.splitText(
        parseEditorJsDataIntoMarkdown(data)
      )

      return splits.map((s, idx) => {
        return {
          text: s,
          id: `${p.id}-${idx}`,
        }
      })
    })
  )
  const docs = splitTexts
    .flat()
    .filter((t) => !!t && !!t.text)
    .map((t) => {
      ids.push(t.id)
      return {
        pageContent: t.text,
        metadata: { siteId: site.id, type: 'writing' },
      } as Document
    })

  return { docs, ids }
}

export async function indexExists(client: PineconeClient, indexName: string) {
  const indexes = await client.listIndexes()
  console.log('Existing Pinecone Indexes:', indexes)
  return indexes.includes(indexName)
}

/**
 * Look up existing trained index
 */
export async function getTrainedIndex(context: Context) {
  const client = await initPineconeClient()
  const indexName = getIndexName(context)

  if (!(await indexExists(client, indexName))) return null

  const pineconeIndex = client.Index(indexName)

  return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
    pineconeIndex,
  })
}

export async function deleteIndex(context: Context) {
  const client = await initPineconeClient()
  const indexName = getIndexName(context)

  console.log('Deleting Pinecone index', indexName)
  await client.deleteIndex({
    indexName,
  })
}

/**
 * Create a new index
 */
export async function createOrUpdateIndex(context: Context, docs, ids = null) {
  const client = await initPineconeClient()
  const indexName = getIndexName(context)

  if (!(await indexExists(client, indexName))) {
    console.log('Creating Pinecone index', indexName)
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536, // OpenAI's vector dimension
        metric: 'cosine',
        shards: 1,
      },
    })
  }
  const pineconeIndex = client.Index(indexName)

  console.log('Initializing Store...', indexName)
  const pineconeStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  )

  await pineconeStore.addDocuments(docs, ids)
}
