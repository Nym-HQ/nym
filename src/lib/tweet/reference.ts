import { TweetOptions } from './utils/types'

const tailwindClassBasic = {
  'tweet-header': 'flex items-center justify-between',
  'tweet-author': 'relative flex items-center',
  'tweet-author-image': 'w-12 h-12 rounded-full',
  'tweet-author-info': 'ml-4',
  'tweet-author-name': 'font-medium',
  'tweet-author-handler': 'text-blue-400',
  'tweet-content': 'mt-4',
  'tweet-content-link': 'text-blue-400',
  'tweet-info': 'mt-4 text-sm flex items-center text-slate-400',
  'tweet-info-favourite': 'w-5 h-5 mr-2',
  'tweet-info-date': 'ml-4',
}

const tailwindBorder = 'border border-gray-200 dark:border-gray-700 rounded-2xl'

const tailwindClassDefaultReference = {
  ...tailwindClassBasic,
  tweet: `w-[500px] p-8 text-black dark:text-white ${tailwindBorder} bg-white dark:bg-black`,
  'tweet-author-title': 'flex items-center',
  'tweet-author-verified': 'ml-1 w-5 h-5 text-blue-400',
  'tweet-logo': 'text-blue-400',
}
const tailwindClassSupabaseReference = {
  ...tailwindClassBasic,
  tweet: `w-[400px] p-8 text-black dark:text-white ${tailwindBorder} bg-white dark:bg-black`,
  'tweet-logo':
    'bg-blue-400 text-white w-5 h-5 absolute -top-1 -left-2 rounded-full p-[0.2rem]',
}

export const mapClass = (key: string, options: TweetOptions): string => {
  if (options.css == 'tailwind') {
    let v =
      options.layout == 'supabase'
        ? tailwindClassSupabaseReference[key]
        : tailwindClassDefaultReference[key]
    if (key === 'tweet') {
      // remove border if show_card is false
      if (!options.show_card) {
        v = v
          .replace(tailwindBorder, '')
          .replace('w-[500px]', '')
          .replace('w-[400px]', '')
      }
    }
    return v
  } else return key
}

const classToStylesMap = {
  flex: 'display: flex',
  'items-center': 'align-items: center',
  'justify-between': 'justify-content: space-between',
  relative: 'position: relative',
  'w-[500px]': 'width: 500px',
  'w-[400px]': 'width: 400px',
  'mt-4': 'margin-top: 1rem',
  'w-5': 'width: 1.25rem',
  'h-5': 'height: 1.25rem',
  'mr-2': 'margin-right: 0.5rem',
  'text-sm': 'font-size: 0.875rem',
  'text-blue-400': 'color: #3b82f6',
  'text-slate-400': 'color: #6b7280',
  border: 'border-width: 1px',
  'border-gray-200': 'border-color: #d1d5db',
  'rounded-2xl': 'border-radius: 1rem',
  'w-12': 'width: 3rem',
  'h-12': 'height: 3rem',
  'rounded-full': 'border-radius: 9999px',
  'ml-4': 'margin-left: 1rem',
  'font-medium': 'font-weight: 500',
  'p-8': 'padding: 2rem',
  'text-black': 'color: #000',
  'bg-white': 'background-color: #fff',
  'text-white': 'color: #fff',
  absolute: 'position: absolute',
  '-top-1': 'top: -0.25rem',
  '-left-2': 'left: -0.5rem',
  'p-[0.2rem]': 'padding: 0.2rem',
  'overflow-hidden': 'overflow: hidden',
  'w-[130px]': 'width: 130px',
  'h-[130px]': 'height: 130px',
  'text-[0.95rem]': 'font-size: 0.95rem',
  'text-[0.9rem]': 'font-size: 0.9rem',
  'p-3': 'padding: 0.75rem',
  'my-0.5': 'margin-top: 0.125rem; margin-bottom: 0.125rem',
  'flex-col': 'flex-direction: column',
  'justify-center': 'justify-content: center',
  'border-t': 'border-top-width: 1px',
  'border-l': 'border-left-width: 1px',
  'fill-current': 'fill: currentColor',
  iconify: 'display: inline-block',
  'iconify--mdi': 'display: inline-block',
}

export const mapStyles = (classes: string | string[], styles?: string) => {
  let clss = typeof classes === 'string' ? classes.split(' ') : classes
  const leftClasses = []
  const finalStyles = styles ? [styles] : []

  clss.forEach((c) => {
    if (classToStylesMap[c]) {
      finalStyles.push(classToStylesMap[c])
    } else {
      console.log(c)
      leftClasses.push(c)
    }
  })
  return { styles: finalStyles.join(';'), classes: leftClasses.join(' ') }
}
