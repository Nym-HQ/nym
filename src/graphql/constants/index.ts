import { baseUrl } from '~/config/seo'

export const IS_PROD = process.env.NODE_ENV === 'production'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_PREVIEW =
  process.env.VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
export const GRAPHCDN_PURGE_ENDPOINT = process.env.GRAPHCDN_PURGE_ENDPOINT
export const CLIENT_URL = IS_PROD ? baseUrl : 'http://localhost:3000'

// const PREVIEW_URL = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
export const PUBLIC_URL = process.env.PUBLIC_URL || ''

export const GRAPHQL_ENDPOINT = IS_DEV
  ? '/api/graphql'
  : `${PUBLIC_URL}/api/graphql`

export const PAGINATION_AMOUNT = 24

export const RATE_LIMIT_REQUEST_AMOUNT = 1024
export const RATE_LIMIT_REQUEST_DURATION = 10 * 1000 // 10 seconds

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

export const NYM_APP_SITE = {
  id: '0',
  subdomain: 'app',
  parkedDomain: '',
  plan: 'free',
  name: 'Nym App',
  description: '',
  logo: `${PUBLIC_URL}/static/meta-icon-192.png`,
  banner: null,
  attach_css: null,
  attach_js: null,
  newsletter_provider: null,
  newsletter_setting1: null,
  newsletter_setting2: null,
  newsletter_setting3: null,
  social_twitter: 'nym_xyz',
  social_youtube: '',
  social_github: 'alpha8eta',
  social_other1: null,
  social_other1_label: null,
}
