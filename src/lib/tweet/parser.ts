import { format } from 'date-fns'
import Twemoji from 'twemoji'

import { mapClass, mapStyles } from './reference'
import { TweetOptions, TweetSyndication } from './utils/types'

/**
 * Parse a twitter url and get twitter status id
 * @param url
 * @returns
 */
export const getTwitterId = (url: string): string | boolean => {
  const u = new URL(url)
  let u1 = `${u.origin}${u.pathname}`
  let match = /https:\/\/twitter.com\/(.*)\/status\/([0-9]+)/g.exec(u1)
  if (match) {
    return match[2]
  }
  return false
}

const stylerAttr = (classes: string, styles: string, options: TweetOptions) => {
  if (options.inline_styles) {
    const { styles: finalStyles, classes: leftClasses } = mapStyles(
      classes,
      styles
    )
    return `${leftClasses ? `class="${leftClasses}"` : ''} ${
      finalStyles ? `style="${finalStyles}"` : ''
    }`
  } else
    return `${classes ? `class="${classes}"` : ''} ${
      styles ? `style="${styles}"` : ''
    }`
}

/**
 * Construct a card content HTML for a tweet
 *
 * @param data
 * @param options
 * @param isQuotedTweet
 * @returns
 */
export const constructHtml = (
  data: TweetSyndication,
  options: TweetOptions,
  isQuotedTweet = false
) => {
  try {
    const mapClassOptions = (key: string) => mapClass(key, options)
    const stylerAttrOptions = (classes: string, styles?: string) =>
      stylerAttr(classes, styles, options)

    const {
      meta,
      html: content,
      user,
      media_html,
      card_html,
      quoted_tweet,
    } = getTweetContent(data, options)
    const quoted_html = getQuotedHtml(quoted_tweet as any, options)
    const tweet_class = isQuotedTweet
      ? mapClassOptions('tweet')
          .replace('w-[400px]', '')
          .replace('w-[500px]', '')
          .concat(' mt-4')
      : mapClassOptions('tweet')

    let favorite_count_str
    if (meta.favorite_count >= 1000000) {
      favorite_count_str = (meta.favorite_count / 1000000).toFixed(1) + ' m'
    } else if (meta.favorite_count >= 10000) {
      favorite_count_str = (meta.favorite_count / 1000).toFixed(1) + ' K'
    } else {
      favorite_count_str = meta.favorite_count?.toLocaleString('en-US')
    }
    const html: string = ` 
  <div ${stylerAttrOptions(tweet_class)} data-style="${options.layout}">
    <div ${stylerAttrOptions(mapClassOptions('tweet-header'))}>
      ${
        options.layout == 'supabase'
          ? `<div ${stylerAttrOptions(mapClassOptions('tweet-author'))}>
        <svg ${stylerAttrOptions(
          mapClassOptions('tweet-logo')
        )} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" ${stylerAttrOptions(
              'iconify iconify--mdi'
            )} width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"></path></svg>
        <img ${stylerAttrOptions(mapClassOptions('tweet-author-image'))} src="${
              user.profile_image_url_https
            }" >
        <div ${stylerAttrOptions(mapClassOptions('tweet-author-info'))}>
          <p ${stylerAttrOptions(mapClassOptions('tweet-author-name'))}></p>
          <a ${stylerAttrOptions(
            mapClassOptions('tweet-author-handler')
          )} target="_blank" href="https://twitter.com/${user.screen_name}">@${
              user.screen_name
            }</a>
          </div>
          </div>`
          : `<div ${stylerAttrOptions(mapClassOptions('tweet-author'))}>
          <img ${stylerAttrOptions(
            mapClassOptions('tweet-author-image')
          )} src="${user.profile_image_url_https}" >
            <div ${stylerAttrOptions(mapClassOptions('tweet-author-info'))}>
              <div ${stylerAttrOptions(mapClassOptions('tweet-author-title'))}>
                <p ${stylerAttrOptions(mapClassOptions('tweet-author-name'))}>${
              user.name
            }</p>
                ${
                  user.verified
                    ? `<svg ${stylerAttrOptions(
                        mapClassOptions('tweet-author-verified')
                      )} viewBox="0 0 24 24"><g><path fill="currentColor" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>`
                    : ''
                }
              </div>
              <a ${stylerAttrOptions(
                mapClassOptions('tweet-author-handler')
              )} target="_blank" href="https://twitter.com/${
              user.screen_name
            }">@${user.screen_name}
              </a>
            </div>
      </div>
      <svg ${stylerAttrOptions(
        mapClassOptions('tweet-logo')
      )} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" ${stylerAttrOptions(
              'iconify iconify--mdi'
            )} width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"></path></svg>`
      }
    </div>
      
    <div ${stylerAttrOptions(mapClassOptions('tweet-content'))}>
      ${content}
      ${options.show_media ? media_html : ''}
      ${options.show_media ? card_html : ''}
      ${options.show_quoted_tweet ? quoted_html : ''} 
    </div>

    ${
      options.show_info && !isQuotedTweet
        ? `
    <div ${stylerAttrOptions(mapClassOptions('tweet-info'))}  >
    <svg ${stylerAttrOptions(
      mapClassOptions('tweet-info-favourite')
    )} width="24" height="24" viewBox="0 0 24 24"><path ${stylerAttrOptions(
            'fill-current'
          )} d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.813-1.148 2.353-2.73 4.644-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.375-7.454 13.11-10.037 13.156H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.035 11.596 8.55 11.658 1.52-.062 8.55-5.917 8.55-11.658 0-2.267-1.822-4.255-3.902-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.015-.03-1.426-2.965-3.955-2.965z"></path></svg>
    <span>${favorite_count_str}</span>
    <div ${stylerAttrOptions(mapClassOptions('tweet-info-date'))}>${format(
            new Date(meta.created_at),
            'h:mm a · MMM d, y'
          )}</div>
    </div>
    `
        : ''
    }
  </div> 
  `
    return { html, meta }
  } catch (err) {
    throw err
  }
}

export const getSyndication = async (id: string) => {
  const resp = await fetch(
    `https://cdn.syndication.twimg.com/tweet-result?id=${id}`
  )
  const data = await resp.json()
  return data as TweetSyndication
}

export const getTweetContent = (
  data: TweetSyndication,
  options: TweetOptions
) => {
  try {
    const {
      display_text_range,
      entities,
      user,
      card,
      text,
      quoted_tweet,
      photos,
      video,
    } = data
    let html = text.substring(0, display_text_range[0])

    const meta = {
      user_id: user.id_str,
      name: user.name,
      screen_name: user.screen_name,
      verified: user.verified,
      profile_image_url_https: user.profile_image_url_https,
      url: 'https://twitter.com/' + user.screen_name + '/status/' + data.id_str,
      profile_url: 'https://twitter.com/' + user.screen_name,
      created_at: data.created_at,
      favorite_count: data.favorite_count,
      conversation_count: data.conversation_count,
      host: 'twitter.com',
      title: card?.binding_values?.title?.string_value,
      description: card?.binding_values?.description?.string_value,
    }

    const stylerAttrOptions = (classes: string, styles?: string) =>
      stylerAttr(classes, styles, options)
    const linkClass =
      options.css == 'tailwind' ? 'text-blue-400' : 'tweet-content-link'
    entities.urls?.forEach((i) => {
      html = html.replace(
        i.url,
        i.display_url.includes('twitter.com')
          ? ''
          : `<a ${stylerAttrOptions(linkClass)} href="${
              i.url
            }" target="_blank">${i.display_url}</a>`
      )
    })
    entities.media?.forEach((i) => {
      html = html.replace(i.url, '')
    })
    entities.hashtags?.forEach((i) => {
      html = html.replace(
        `#${i.text}`,
        `<a ${stylerAttrOptions(linkClass)} href="https://twitter.com/hashtag/${
          i.text
        }" target="_blank">#${i.text}</a>`
      )
    })
    entities.user_mentions?.forEach((i) => {
      html = html.replace(
        `@${i.screen_name}`,
        `<a ${stylerAttrOptions(linkClass)}  href="https://twitter.com/${
          i.screen_name
        }" target="_blank">@${i.screen_name}</a>`
      )
    })
    html = html.replace(/\n/g, '<br />')

    if (options.enable_twemoji) {
      html = Twemoji.parse(html, {
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
        folder: 'svg',
        ext: '.svg',
        className:
          options.css === 'tailwind'
            ? 'inline-block align-text-bottom w-[1.2em] h-[1.2em] mr-[0.05em] ml-[0.1em]'
            : 'emoji',
      })
    }

    let card_html = ''
    const mediaClass =
      options.css == 'tailwind'
        ? 'border border-gray-200 rounded-2xl mt-4 overflow-hidden'
        : 'tweet-media'

    if (card?.name === 'summary_large_image') {
      html.replace(card.url, '')
      card_html =
        options.css === 'tailwind'
          ? `
        <a href="${card.url}" target="_blank">
          <div ${stylerAttrOptions(mediaClass)}>
            <img src="${
              card.binding_values.thumbnail_image_large.image_value.url
            }" >
            <div ${stylerAttrOptions(
              'border-t border-gray-200 text-slate-400 text-[0.95rem] p-3'
            )}>
              <span ${stylerAttrOptions('text-[0.9rem]')}>${
              card.binding_values.vanity_url.string_value
            }</span>
              <h2 ${stylerAttrOptions('text-black leading-relaxed my-0.5')}>${
              card.binding_values.title.string_value
            }</h2>
              <p ${stylerAttrOptions('leading-snug')}>${
              card.binding_values.description.string_value
            }</p>
            </div>
          </div>
        </a>`
          : `
        <a href="${card.url}" target="_blank">
          <div ${stylerAttrOptions(mediaClass + ' tweet-summary-large-image')}>
            <img src="${
              card.binding_values.thumbnail_image_large.image_value.url
            }" >
            <div ${stylerAttrOptions('tweet-summary-card-text')}>
              <span>${card.binding_values.vanity_url.string_value}</span>
              <h2>${card.binding_values.title.string_value}</h2>
              <p>${card.binding_values.description.string_value}</p>
            </div>
          </div>
        </a>`
    }
    if (card?.name === 'summary') {
      html.replace(card.url, '')
      card_html =
        options.css === 'tailwind'
          ? `
        <a href="${card.url}" target="_blank">
          <div ${stylerAttrOptions(mediaClass + ' flex')}>
            <img ${stylerAttrOptions('w-[130px] h-[130px]')} src="${
              card.binding_values.thumbnail_image_large.image_value.url
            }" >
            <div ${stylerAttrOptions(
              'flex flex-col justify-center border-l border-gray-200 text-slate-400 text-[0.95rem] p-3'
            )}>
              <span ${stylerAttrOptions('text-[0.9rem]')}>${
              card.binding_values.vanity_url.string_value
            }</span>
              <h2 ${stylerAttrOptions('text-black leading-relaxed my-0.5')}>${
              card.binding_values.title.string_value
            }</h2>
              <p ${stylerAttrOptions('leading-snug')}>${
              card.binding_values.description.string_value
            }</p>
            </div>
          </div>
        </a>`
          : `
        <a href="${card.url}" target="_blank">
          <div ${stylerAttrOptions(mediaClass + ' tweet-summary')}>
            <img src="${
              card.binding_values.thumbnail_image_large.image_value.url
            }" >
            <div ${stylerAttrOptions('tweet-summary-card-text')}>
              <span>${card.binding_values.vanity_url.string_value}</span>
              <h2>${card.binding_values.title.string_value}</h2>
              <p>${card.binding_values.description.string_value}</p>
            </div>
          </div>
        </a>`
    }

    let media_html = ''
    if (photos) {
      media_html = `<div ${stylerAttrOptions(mediaClass)}>`
      photos.map((photo) => {
        media_html += `<img ${stylerAttrOptions(
          'tweet-image',
          'width: 100%'
        )} src="${photo.url}">`
      })
      media_html += `</div>`
    }
    if (video) {
      const mp4 = video.variants.find((i) => i.type === 'video/mp4')
      media_html = `
    <div ${stylerAttrOptions(mediaClass)}>
      <video style="width: 100%" autoplay muted loop src="${mp4.src}"></video> 
    </div>`
    }

    return {
      meta,
      html,
      user,
      card_html,
      media_html,
      quoted_tweet,
    }
  } catch (err) {
    throw err
  }
}

/**
 * Quoted tweet card
 *
 * @param data
 * @param options
 * @returns
 */
const getQuotedHtml = (data: TweetSyndication, options: TweetOptions) => {
  if (!data) return ''

  const stylerAttrOptions = (classes: string, styles?: string) =>
    stylerAttr(classes, styles, options)

  const url = `https://twitter.com/${data.user.screen_name}/status/${data.id_str}`
  return `<div ${stylerAttrOptions('tweet-quoted')}>
       ${constructHtml(data, options, true).html} 
    </div>`
}
