import { Context } from '@apollo/client'
import { PineconeClient } from '@pinecone-database/pinecone'
import { PostAccess } from '@prisma/client'
import * as cheerio from 'cheerio'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

import parseEditorJsDataIntoMarkdown from '../editorjs/markdownParser'
import { extractMainText } from '../scraper/getUrlMetaData'

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

export function getIndexName() {
  return `nym-chatbot`
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

  const { docs: postsDocs, ids: postsDocIds } = await getPostsTrainData(context)

  const { docs: bookmarksDocs, ids: bookmarksDocIds } =
    await getBookmarksTrainData(context)

  return {
    docs: [...postsDocs, ...bookmarksDocs],
    ids: [...postsDocIds, ...bookmarksDocIds],
  }
}

async function getPostsTrainData(context: Context) {
  const { prisma, site } = context
  const publishedPosts = await prisma.post.findMany({
    where: {
      siteId: site.id,
      publishedAt: { not: null, lt: new Date() },
      access: { equals: PostAccess.PUBLIC }, // only publicly available posts are used as training materials
    },
  })

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
  })

  const ids = []
  const splitTexts = await Promise.all(
    publishedPosts.map(async (p) => {
      let text
      let data = p.data
      if (typeof p.data === 'string') {
        try {
          data = JSON.parse(p.data)
        } catch {
          data = null
        }
      }

      if (data && data.blocks && data.blocks.length > 0) {
        text = parseEditorJsDataIntoMarkdown(data)
      } else if (p.text) {
        text = p.text
      } else {
        return null
      }

      // add title
      text = `# ${p.title}\n\n${text}`

      const splits = await textSplitter.splitText(text)
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

async function getBookmarksTrainData(context: Context) {
  const { prisma, site } = context
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      siteId: site.id,
    },
  })

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
  })

  const ids = []
  const splitTexts = await Promise.all(
    bookmarks.map(async (b) => {
      const html = b.html || b.content
      if (!html) return null

      // extract texts from html
      const $ = cheerio.load(html)
      const text = extractMainText($)

      const splits = await textSplitter.splitText(text)
      return splits.map((s, idx) => {
        return {
          text: s,
          id: `b-${b.id}-${idx}`,
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
        metadata: { siteId: site.id, type: 'bookmark' },
      } as Document
    })

  return { docs, ids }
}

export async function indexExists(client: PineconeClient, indexName: string) {
  const indexes = await client.listIndexes()
  console.info('Existing Pinecone Indexes:', indexes)
  return indexes.includes(indexName)
}

/**
 * Look up existing trained index
 */
export async function getTrainedIndex() {
  const client = await initPineconeClient()
  const indexName = getIndexName()

  if (!(await indexExists(client, indexName))) return null

  const pineconeIndex = client.Index(indexName)

  return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
    pineconeIndex,
  })
}

export async function deleteIndex(context: Context) {
  const client = await initPineconeClient()
  const indexName = getIndexName()

  console.info('Deleting Pinecone index', indexName)
  await client.deleteIndex({
    indexName,
  })
}

/**
 * Create a new index
 */
export async function createOrUpdateIndex(context: Context, docs, ids = null) {
  const client = await initPineconeClient()
  const indexName = getIndexName()

  if (!(await indexExists(client, indexName))) {
    console.info('Creating Pinecone index', indexName)
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

  console.info('Initializing Store...', indexName)
  const pineconeStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  )

  console.info(`Updating Store... ${indexName}, total ${docs.length} docs`)

  const chunks = []
  const chunkSize = 5
  for (let i = 0; i < docs.length; i += chunkSize) {
    chunks.push({
      docs: docs.slice(i, i + chunkSize),
      ids: ids ? ids.slice(i, i + chunkSize) : undefined,
    })
  }

  let progress = 0
  for (let chunk of chunks) {
    progress += chunk.docs.length
    try {
      await pineconeStore.addDocuments(
        chunk.docs,
        chunk.ids ? chunk.ids : undefined
      )
    } catch (err) {
      console.error('Error adding documents', err)
      console.log('Error Chunk', chunk)
    }
    if (progress % (chunkSize * 5) == 0) {
      console.log(`${progress} docs added...`)
    }
  }

  console.info('Completed Updating Index Store...', indexName)
}
