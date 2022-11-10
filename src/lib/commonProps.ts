import { NextPageContext } from 'next'

import { isAuthenticatedServerSide } from './auth/nextauth'
import { getSubdomain, isMainAppDomain } from './multitenancy/client'
import { getSiteByDomain, getUserSiteById } from './multitenancy/server'

export interface CommonPageProps {
  site: {
    domain: string
    isAppDomain: boolean
    subdomain: string
    siteId: string | null
  }
}

export async function getCommonPageProps(
  context: NextPageContext
): Promise<CommonPageProps> {
  const domain = context.req.headers.host
  const isAppDomain = isMainAppDomain(domain)
  const subdomain = getSubdomain(domain)
  const site = isAppDomain ? null : await getSiteByDomain(domain)

  return {
    site: {
      domain,
      isAppDomain,
      subdomain,
      siteId: site ? site.id : null,
    },
  }
}
