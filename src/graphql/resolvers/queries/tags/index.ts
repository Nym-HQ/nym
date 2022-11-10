import { Context } from '~/graphql/context'

export async function getTags(_, __, ctx: Context) {
  const { prisma, site } = ctx

  if (!site) return null

  try {
    return [
      { name: 'website' },
      { name: 'reading' },
      { name: 'portfolio' },
      { name: 'indie' },
      { name: 'open source' },
    ]
    // return await prisma.tag.findMany({
    //   where: { siteId: site.id },
    //   orderBy: { name: 'desc' },
    // })
  } catch (e) {
    return []
  }
}
