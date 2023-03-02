import { constructHtml, getSyndication, getTwitterId } from './parser'
import { TweetOptions, TweetSyndication } from './utils/types'

const cachedData: { [key: string]: TweetSyndication } = {}

export const getTweetCardHtml = async (
  url: string,
  config: any = {
    layout: 'default',
    css: 'tailwind',
    enable_twemoji: true,
    show_card: false,
    inline_styles: true,
  }
) => {
  const id = getTwitterId(url)
  // Check valid twitter id
  if (typeof id !== 'string')
    throw new Error('Invalid Twitter ID or not defined.')

  const {
    layout,
    css,
    enable_twemoji,
    show_media = false,
    show_quoted_tweet = false,
    show_info = false,
    show_card,
    inline_styles,
  } = config || {}

  const options: TweetOptions = {
    layout: layout?.toString(),
    css: css?.toString(),
    enable_twemoji: JSON.parse(enable_twemoji.toString()),
    show_media: JSON.parse(show_media.toString()),
    show_quoted_tweet: JSON.parse(show_quoted_tweet.toString()),
    show_info: JSON.parse(show_info.toString()),
    show_card: JSON.parse(show_card.toString()),
    inline_styles: JSON.parse(inline_styles.toString()),
  }

  let data: TweetSyndication
  if (cachedData[id]) {
    data = cachedData[id]
  } else {
    data = await getSyndication(id.toString())
    cachedData[id] = data
  }
  return constructHtml(data, options)
}
