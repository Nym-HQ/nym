import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

import { UserRole } from '~/graphql/types.generated'

/**
 * Get authenticated user, for API access
 *
 * @param ctx
 * @returns
 */
export default async function getApiViewer(
  prisma: PrismaClient,
  authorizationHeader
) {
  try {
    const token = authorizationHeader.replaceAll(/Bearer\s+/gi, '')

    if (!jwt.verify(token, process.env.JWT_SIGNING_KEY)) {
      console.warn('API token verification failed', token)
      return null
    }
    const tokenDecoded = jwt.decode(token) as any

    const viewer = await prisma.user.findUnique({
      where: { id: tokenDecoded.userId },
    })

    return viewer
      ? {
          ...viewer,
          isAdmin: viewer?.role === UserRole.Admin,
        }
      : null
  } catch (e) {
    console.error('API token decode failed', e)
    console.info('API token decode failed', authorizationHeader)
    return null
  }
}
