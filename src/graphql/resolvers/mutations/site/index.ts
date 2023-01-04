import { SiteRole } from '@prisma/client'
import { UserInputError } from 'apollo-server-errors'

import { Context } from '~/graphql/context'
import {
  MutationAddSiteArgs,
  MutationDeleteSiteArgs,
  MutationEditSiteArgs,
  MutationEditSiteDomainArgs,
} from '~/graphql/types.generated'
import { preservedSubdomains } from '~/lib/consts'
import { graphcdn } from '~/lib/graphcdn'
import { addDomainToProject, removeDomainFromProject } from '~/lib/vercel'

export async function editSite(_, args: MutationEditSiteArgs, ctx: Context) {
  const { subdomain, data } = args
  const {
    name = '',
    description = '',
    logo = '',
    banner = '',
    attach_css = '',
    attach_js = '',
    mailgun_region = '',
    mailgun_domain = '',
    mailgun_api_key = '',
    social_twitter = '',
    social_youtube = '',
    social_github = '',
    social_other1 = '',
    social_other1_label = '',
  } = data
  const { prisma, site } = ctx

  const existing = site
    ? await prisma.site.findUnique({
        where: { id: site.id },
      })
    : await prisma.site.findUnique({ where: { subdomain } })

  if (existing?.subdomain !== subdomain)
    throw new UserInputError('Slug already exists')

  return await prisma.site
    .update({
      where: { subdomain },
      data: {
        name,
        description,
        logo,
        banner,
        attach_css,
        attach_js,
        mailgun_region,
        mailgun_domain,
        mailgun_api_key,
        social_twitter,
        social_youtube,
        social_github,
        social_other1,
        social_other1_label,
      },
    })
    .then((site) => {
      graphcdn.purgeList('sites')
      return site
    })
    .catch((err) => {
      console.error({ err })
      throw new UserInputError('Unable to edit site')
    })
}

export async function editSiteDomain(
  _,
  args: MutationEditSiteDomainArgs,
  ctx: Context
) {
  const { subdomain, data } = args
  const { parkedDomain = '' } = data
  const { prisma, site } = ctx

  const existing = site
    ? await prisma.site.findUnique({
        where: { id: site.id },
      })
    : await prisma.site.findUnique({ where: { subdomain } })

  if (!existing) throw new UserInputError('Site not found')

  if (existing.subdomain !== subdomain)
    throw new UserInputError('Slug already exists')

  if (preservedSubdomains.includes(subdomain))
    throw new UserInputError('Subdomain is reserved')

  // nothing changed
  if (existing.parkedDomain === parkedDomain) {
    return existing
  }

  // Changing parked domain
  if (existing.parkedDomain) {
    // remove old parked domain
    await removeDomainFromProject(existing.parkedDomain)
  }
  if (parkedDomain) {
    await addDomainToProject(parkedDomain)
  }

  return await prisma.site
    .update({
      where: { subdomain },
      data: {
        parkedDomain: parkedDomain || subdomain,
      },
    })
    .then((site) => {
      graphcdn.purgeList('sites')
      return site
    })
    .catch((err) => {
      console.error({ err })
      throw new UserInputError('Unable to edit site')
    })
}

export async function addSite(_, args: MutationAddSiteArgs, ctx: Context) {
  const { data } = args
  const { subdomain } = data
  const { prisma, viewer, site } = ctx

  const existing = await prisma.site.findUnique({ where: { subdomain } })
  if (existing) throw new UserInputError('Subdomain already exists')

  const newSite = await prisma.site.create({
    data: {
      subdomain,
      parkedDomain: subdomain,
    },
  })
  await prisma.userSite.create({
    data: {
      userId: viewer.id,
      siteId: newSite.id,
      siteRole: SiteRole.OWNER,
    },
  })
  return {
    ...newSite,
    parkedDomain: null,
  }
}

export async function deleteSite(
  _,
  args: MutationDeleteSiteArgs,
  ctx: Context
) {
  const { subdomain } = args
  const { prisma, viewer, site, userSite } = ctx

  let canDelete = false

  if (subdomain == site.subdomain) {
    canDelete = userSite?.siteRole === SiteRole.OWNER
  } else {
    const existing = await prisma.site.findUnique({ where: { subdomain } })
    if (existing) {
      const userSite = await prisma.userSite.findFirst({
        where: {
          userId: viewer.id,
          siteId: existing.id,
        },
      })
      canDelete = userSite?.siteRole === SiteRole.OWNER
    }
  }

  return await prisma.site.delete({
    where: {
      subdomain,
    },
  })
}
