import { SiteRole } from '@prisma/client'

import type { Context } from '~/graphql/context'
import { UserRole } from '~/graphql/types.generated'

export function isSiteAdmin(context: Partial<Context> | null | undefined) {
  return Boolean(
    context?.viewer?.isAdmin ||
      context?.userSite?.siteRole === SiteRole.ADMIN ||
      context?.userSite?.siteRole === SiteRole.OWNER
  )
}

export function canViewSiteSecrets(
  context: Partial<Context> | null | undefined,
  siteId?: string | null
) {
  if (!context?.viewer || !siteId) return false
  if (context.viewer.role === UserRole.Admin) return true
  if (!isSiteAdmin(context)) return false
  return context.site?.id === siteId
}

export function canViewerDeleteSite(siteRole?: string | null) {
  return siteRole === SiteRole.OWNER
}
