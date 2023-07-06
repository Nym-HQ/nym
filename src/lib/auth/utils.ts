import { getServerSession } from 'next-auth'

import { authOptions } from './nextauth'

/**
 * Utility function to check if the user is authenticated
 * @param req
 * @param res
 *
 * @returns
 */
export const isAuthenticatedServerSide = async (ctx) => {
  const session: any = await getServerSession(ctx.req, ctx.res, authOptions)
  return session?.user
}
