import { Context } from '~/graphql/context'

export async function getTags(_, __, ctx: Context) {
  const { prisma, site } = ctx

  if (!site) return null

  const tags = [
    { name: 'website' },
    { name: 'reading' },
    { name: 'portfolio' },
  ]

  try {
    const dbTags = await prisma.tag.findMany({
      where: { siteId: site.id },
      orderBy: { name: 'asc' },
    })
    dbTags.forEach(tag => {
      const index = tags.findIndex(t => t.name === tag.name)
      if (index === -1) tags.push(tag)
    })
  } catch (e) {
  }
  return tags
}
