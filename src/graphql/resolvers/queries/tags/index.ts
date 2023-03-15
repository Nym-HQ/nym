import { NYM_APP_SITE } from '~/graphql/constants'
import { Context } from '~/graphql/context'

export async function getTags(_, __, ctx: Context) {
  const { prisma, site } = ctx

  if (!site || site.id === NYM_APP_SITE.id) return null

  const tags = [{ name: 'website' }, { name: 'reading' }, { name: 'portfolio' }]

  try {
    const dbTags = await prisma.tag.findMany({
      where: { siteId: site.id },
      orderBy: { name: 'asc' },
    })
    dbTags.forEach((tag) => {
      const index = tags.findIndex((t) => t.name === tag.name)
      if (index === -1) tags.push({ name: tag.name })
    })
  } catch (e) {}
  return tags
}
