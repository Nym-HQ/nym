import * as cheerio from 'cheerio'
import URL from 'url'

import { validUrl } from '~/lib/validators'

/**
 * NOTE: IFramely is a great service for getting metadata.
 *      It has a free tier but sometimes it is not enough.
 *
 * @param url
 * @returns
 */
export default async function getUrlMetaData(url) {
  const res = await fetch(url)
  const contentType = (
    res.headers.get('Content-Type') || 'text/html'
  ).toLowerCase()

  const { host, protocol } = URL.parse(url)
  let title = '',
    image = '',
    description = '',
    author = '',
    creator = '',
    faviconUrl = null,
    text = ''

  if (
    [
      'text/html',
      'application/xhtml+xml',
      'application/xml',
      'text/xml',
    ].includes(contentType)
  ) {
    const html = await res.text()
    const $ = cheerio.load(html)

    const TITLE_LIMIT = 280
    const IMAGE_LIMIT = 512
    const DESCRIPTION_LIMIT = 2048

    const getMetavalue = (name) =>
      $(`meta[name=${name}]`).attr('content') ||
      $(`meta[name="twitter:${name}"]`).attr('content') ||
      $(`meta[property=${name}]`).attr('content') ||
      $(`meta[property="twitter:${name}"]`).attr('content') ||
      null

    const favicon =
      $(`link[rel="apple-touch-icon"]`).attr('href') ||
      $(`link[rel="shortcut icon"]`).attr('href') ||
      $(`link[rel="icon"]`).attr('href')
    if (favicon) {
      if (favicon.startsWith('data:')) {
        // if the favicon is a hard-coded URL, or points to some external asset
        // like a CDN, then just use that
        faviconUrl = null
      } else if (validUrl(favicon)) {
        // sometimes favicons are embedded svgs, usually prefixed with `data:`
        // we can ignore these, since we're not going to render svgs
        faviconUrl = favicon
      } else {
        // otherwise, we are dealing with a relative path and need to sanitize
        // replace .. because sometimes people use relative paths
        faviconUrl = favicon.replace('..', '')
        // ensure there is a leading /
        if (faviconUrl[0] !== '/') faviconUrl = `/${faviconUrl}`
        faviconUrl = `${protocol}//${host}${faviconUrl}`
      }
    }

    // it's possible that a url doesn't return a title
    title = $('title').first().text() || $('h1').first().text()
    title = title ? title.substring(0, TITLE_LIMIT) : title

    // it's possible that a url doesn't return a description
    description = getMetavalue('description')
    description = description
      ? description.substring(0, DESCRIPTION_LIMIT)
      : description

    image = getMetavalue('image')
    image = image ? (image.length > IMAGE_LIMIT ? null : image) : image

    author = getMetavalue('author')
    creator = getMetavalue('creator')
    text = extractMainText($)
  } else if (
    contentType.startsWith('text/') ||
    contentType === 'application/json'
  ) {
    text = await res.text()
  } else if (
    contentType.startsWith('image/') ||
    contentType.startsWith('video/') ||
    contentType.startsWith('audio/')
  ) {
    image = url
  }

  return {
    url,
    host,
    title,
    image,
    description,
    author,
    creator,
    faviconUrl,
    text,
  }
}

export function extractMainText($) {
  return (
    $('article').text() ||
    $('main').text() ||
    $('[role=main]').text() ||
    $('body').text() ||
    $.text()
  )
}
