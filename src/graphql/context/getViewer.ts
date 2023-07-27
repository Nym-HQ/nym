import { getServerSession } from 'next-auth'

import { UserRole } from '~/graphql/types.generated'
import { authOptions } from '~/lib/auth/nextauth'
import prisma from '~/lib/prisma'

export default async function getViewer(ctx) {
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
