// !NOTE: make sure you make all functions here to be browser compatible (not server-side dependent)
import { SiteRole } from '~/graphql/types.generated'

export function formatSiteRole(role: SiteRole) {
  if (role === SiteRole.Owner) return 'Owner'
  else if (role === SiteRole.Admin) return 'Administrator'
  else if (role === SiteRole.User) return 'Member'
  else if (role === SiteRole.PaidUser) return 'Paid-member'
  else return 'Visitor'
}
