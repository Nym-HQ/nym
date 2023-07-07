import { getServerSession } from 'next-auth'

import { UserRole } from '~/graphql/types.generated'
import { authOptions } from '~/lib/auth/nextauth'

export default async function getViewer(ctx) {
  try {
    const session: any = await getServerSession(ctx.req, ctx.res, authOptions)
    const viewer = session?.user

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
