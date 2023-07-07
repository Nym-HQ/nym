import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (typeof window !== 'undefined') {
  // skip prisma intialization on the client
} else if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
