import { isValidParkedDomain } from '~/lib/utils'

export function viewSite(_, __, { site }) {
  return site
}

export async function getUserSites(_, __, { viewer, prisma }) {
  const userSites = await prisma.userSite.findMany({
    where: { userId: viewer.id },
  })

  const siteIds = (userSites || []).map((userSite) => userSite.siteId)
  const sites = await prisma.site.findMany({
    where: {
      id: { in: siteIds },
    },
  })

  return userSites.map((userSite) => {
    const site = sites.find((site) => site.id === userSite.siteId)
    return {
      ...userSite,
      site: {
        ...site,
        parkedDomain: isValidParkedDomain(site.parkedDomain)
          ? site.parkedDomain
          : null,
      },
    }
  })
}
