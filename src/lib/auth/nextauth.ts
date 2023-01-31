import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions, unstable_getServerSession } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import TwitterProvider, {
  TwitterLegacyProfile,
  TwitterProfile,
} from 'next-auth/providers/twitter'

import { prisma } from '~/lib/prisma'

const providers = []

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  )
}

if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
  providers.push(
    TwitterProvider({
      // version: process.env.TWITTER_OAUTH_VER == '2.0' ? '2.0' : '1.0',

      // for OAuth 2.0
      version: '2.0',
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,

      // for OAuth 1.0 : Twitter prefers this
      // clientId: process.env.TWITTER_API_KEY,
      // clientSecret: process.env.TWITTER_API_SECRET,

      profile: (profile: TwitterProfile | TwitterLegacyProfile) => {
        console.debug('Got twitter profile data', profile)
        if ('data' in profile) {
          // OAuth 2.0
          return {
            id: profile.data.id,
            name: profile.data.name,
            // NOTE: E-mail is currently unsupported by OAuth 2 Twitter.
            email: null,
            username: profile.data.username,
            image: profile.data.profile_image_url,
          }
        } else {
          return {
            id: profile.id_str,
            name: profile.name,
            email: (profile as any).email,
            username: profile.screen_name,
            image: profile.profile_image_url_https.replace(
              /_normal\.(jpg|png|gif)$/,
              '.$1'
            ),
          }
        }
      },
    })
  )
}

const authOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: providers,
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      if (token) (session as any).accessToken = token.accessToken

      if (user) {
        session.user = {
          ...session.user,
          id: user.id,
          role: (user as any).role,
          username: (user as any).username,
        }
      }

      return session
    },
  },
} as NextAuthOptions

/**
 * Utility function to check if the user is authenticated
 * @param req
 * @param res
 *
 * @returns
 */
const isAuthenticatedServerSide = async (ctx) => {
  const session: any = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions
  )
  return session?.user
}

export { authOptions, isAuthenticatedServerSide }
