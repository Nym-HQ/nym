import { Site } from '~/graphql/types.generated'
import { getSiteDomain } from '~/lib/multitenancy/client'

export const baseUrl =
  process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : ''
export const baseEmail = process.env.BASE_EMAIL || 'hello@nymhq.com'

export const defaultSEO = {
  title: '',
  description: '',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    site_name: 'Nym HQ',
    images: [
      {
        url: `${baseUrl}/static/og/default.png`,
        alt: 'Nymhq.com',
      },
    ],
  },
  twitter: {
    handle: '@nym_xyz',
    site: 'nymhq.com',
    cardType: 'summary_large_image',
  },
}

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
}

function getSiteDefaultSEO(site: Site) {
  const domain = getSiteDomain(site)
  const twitterHandle = site.social_twitter
    ? site.social_twitter.replace('https://twitter.com/', '')
    : null
  const twitter = {
    ...(twitterHandle ? { handle: `@${twitterHandle}` } : {}),
    site: domain,
    cardType: 'summary_large_image',
  }

  return {
    title: site.name,
    description: site.description || '',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `https://${domain}`,
      site_name: site.name,
      images: [
        {
          url: site.logo ? site.logo : `${baseUrl}/static/og/default.png`,
          alt: site.name,
        },
      ],
    },
    twitter,
  }
}

export function extendSEO(options: SEOProps, site?: Site) {
  const baseUrl = site
    ? `https://${getSiteDomain(site)}`
    : process.env.PUBLIC_URL || 'https://nymhq.com'
  const siteSEO = site ? getSiteDefaultSEO(site) : defaultSEO

  let images = []
  if (options.image)
    images = [
      {
        url:
          options.image.startsWith('http:') ||
          options.image.startsWith('https:')
            ? options.image
            : `${baseUrl}/static/${options.image}`,
      },
    ]
  else if (site && site.logo) images = [{ url: site.logo }]
  else images = siteSEO.openGraph.images

  const url = `${baseUrl}/${options.url}`

  const seo = {
    ...siteSEO,
    ...options,
    url,
    openGraph: {
      ...siteSEO.openGraph,
      images,
      url,
    },
  }

  // override with site configuration
  seo.title = seo.title
    ? `${seo.title}${site?.name ? ` - ${site.name}` : ''}`
    : `${site?.name || ''}`
  seo.description = `${seo.description || ''}${
    site?.description ? `\n${site.description}` : ''
  }`

  return seo
}
