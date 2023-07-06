import { NextRequest } from 'next/server'

import { Site } from '~/graphql/types.generated'
import { isMainAppDomain } from '~/lib/multitenancy/client'
import { getSiteByDomain } from '~/lib/multitenancy/server'

import { NYM_APP_SITE } from '../constants'

export default async function getSite(req: NextRequest | Request) {
  const host = req.headers['host'] || req.headers['x-forwarded-host']
  if (isMainAppDomain(host)) {
    return NYM_APP_SITE as Site
  }

  const site = await getSiteByDomain(host)
  if (site) {
    // fix parkedDomain, as we are filling them with subdomain values
    // if they are empty just to make it compliant with unique constraint.
    site.parkedDomain =
      site.parkedDomain && site.parkedDomain.indexOf('.') >= 0
        ? site.parkedDomain
        : null
  }
  return site
}
