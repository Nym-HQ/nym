import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

import { UserRole } from '~/graphql/types.generated'
import { authOptions } from '~/lib/auth/nextauth'

export default async function getViewer(prisma: PrismaClient, ctx) {
  try {
    const session: any = await getServerSession(ctx.req, ctx.res, authOptions)
    const sessionUser = session?.user
    const viewer = await prisma.user.findUnique({
      where: { id: sessionUser?.id },
    })

    return viewer
      ? {
          ...viewer,
          isAdmin: viewer?.role === UserRole.Admin,
        }
      : null
  } catch (e) {
    return null
  }
}
