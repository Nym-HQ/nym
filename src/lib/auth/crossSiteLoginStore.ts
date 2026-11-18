import type { PrismaClient } from '@prisma/client'

import type { CrossSiteLoginStore } from './crossSiteLoginCode'

const IDENTIFIER_PREFIX = 'xsite|'

/** Prisma-backed store: reuses the existing Session and VerificationToken tables. */
export function prismaCrossSiteLoginStore(
  prisma: PrismaClient
): CrossSiteLoginStore & { purgeExpired(now?: number): Promise<void> } {
  return {
    async saveCode(tokenHash, record) {
      await prisma.verificationToken.create({
        data: {
          identifier: record.identifier,
          token: tokenHash,
          expires: record.expires,
        },
      })
    },
    async takeCode(tokenHash) {
      const record = await prisma.verificationToken.findUnique({
        where: { token: tokenHash },
      })
      if (!record || !record.identifier.startsWith(IDENTIFIER_PREFIX)) {
        return null
      }
      // Only the caller whose delete removed the row may use it (single use).
      const { count } = await prisma.verificationToken.deleteMany({
        where: { token: tokenHash },
      })
      if (count !== 1) return null
      return { identifier: record.identifier, expires: record.expires }
    },
    async createSession(session) {
      await prisma.session.create({ data: session })
    },
    async purgeExpired(now = Date.now()) {
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: { startsWith: IDENTIFIER_PREFIX },
          expires: { lt: new Date(now) },
        },
      })
    },
  }
}
