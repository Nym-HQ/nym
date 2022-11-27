import { SiteRole } from '@prisma/client'
import { AuthenticationError } from 'apollo-server-micro'

export function requiresSiteAdmin(fn) {
  return function resolve(parent, args, context) {
    if (
      context?.viewer?.isAdmin ||
      context?.userSite?.siteRole === SiteRole.ADMIN ||
      context?.userSite?.siteRole === SiteRole.OWNER
    ) {
      return fn(parent, args, context)
    }

    throw new AuthenticationError('You can’t do that!')
  }
}
