import { Site } from '~/graphql/types.generated'

export const baseUrl =
  process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : ''
export const baseEmail = 'hi@nymhq.com'

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

export function extendSEO(options: SEOProps, site?: Site) {
  const images = options.image
    ? [{ url: `${baseUrl}/static/${options.image}` }]
    : site && site.logo
    ? [{ url: site.logo }]
    : defaultSEO.openGraph.images

  const seo = {
    ...defaultSEO,
    ...options,
    url: `${baseUrl}/${options.url}`,
    openGraph: {
      ...defaultSEO.openGraph,
      images,
      url: `${baseUrl}/${options.url}`,
    },
  }

  // override with site configuration
  seo.title = seo.title
    ? `${seo.title}${site?.name ? ' - ' : ''}${site?.name || ''}`
    : `${site?.name || ''}${site?.description ? ' - ' : ''}${
        site?.description || ''
      }` || ''
  seo.description = `${seo.description ? `${seo.description} |` : ''}${
    site?.description || 'Nym is a personal website maker.'
  }`

  if (site) {
    seo.twitter = {
      handle: `@${site.social_twitter || 'nym_xyz'}`,
      site: `@${site.parkedDomain || `${site.subdomain}.nymhq.com`}`,
      cardType: 'summary_large_image',
    }
  }

  return seo
}
