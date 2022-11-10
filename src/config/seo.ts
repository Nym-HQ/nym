export const baseUrl =
  process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : ''
export const baseEmail = 'hi@nymhq.com'

export const defaultSEO = {
  title: 'Nym',
  description: 'Nym is a personal website maker.',
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

export function extendSEO(options: SEOProps) {
  const images = options.image
    ? [{ url: `${baseUrl}/static/${options.image}` }]
    : defaultSEO.openGraph.images

  return {
    ...defaultSEO,
    ...options,
    url: `${baseUrl}/${options.url}`,
    openGraph: {
      ...defaultSEO.openGraph,
      images,
      url: `${baseUrl}/${options.url}`,
    },
  }
}
