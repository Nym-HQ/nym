import { Page, Post } from '~/graphql/types.generated'

export function parseEditorJsData(data: string) {
  if (!data) return {}

  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

/**
 * Convert a post, particularly the "data" field to object type from string
 *
 * @param post
 */
export function parsePostData(post: Post) {
  if (!post) return null

  return {
    ...post,
    data: parseEditorJsData(post.data),
  }
}

/**
 * Convert a post, particularly the "data" field to object type from string
 *
 * @param post
 */
export function parsePageData(page: Page) {
  if (!page) return null

  return {
    ...page,
    data: parseEditorJsData(page.data),
  }
}

/**
 * Extract feature image from the post/page content
 * 
 * @param text 
 * @param data 
 * @returns 
 */
export function extractFeatureImage(text: string,  data: string) {
  if (text) {
    // <img> tag
    const regex = /<img[^>]+src="([^">]+)"/g
    const match = regex.exec(text)
    if (match) return match[1]

    // markdown
    const regex1 = /![]\(([^">]+)\)/g
    const match1 = regex1.exec(text)
    if (match1) return match1[1]

    return null
  } else if (data) {
    const blocks = parseEditorJsData(data);
    const imageBlock = blocks?.blocks?.find((block: any) => block.type === 'image')
    if (imageBlock) return imageBlock.data.file.url
    return null
  }
  return null;
}