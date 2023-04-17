import { NextPageContext } from 'next'

import { getSubdomain, isMainAppDomain } from './multitenancy/client'

export interface CommonPageProps {
  site: {
    domain: string
    isAppDomain: boolean
    subdomain: string
    siteId: string | null
  }
}

export async function getCommonPageProps(
  context: NextPageContext,
  graphqlContextQueryData?: any
): Promise<CommonPageProps> {
  const domain = context.req.headers.host
  const isAppDomain = isMainAppDomain(domain)
  const subdomain = getSubdomain(domain)

  return {
    site: {
      domain,
      isAppDomain,
      subdomain,
      siteId: graphqlContextQueryData?.data?.context?.site?.id || null,
    },
  }
}
