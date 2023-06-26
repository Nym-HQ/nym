import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getServerSession, NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'
import TwitterProvider, {
  TwitterLegacyProfile,
  TwitterProfile,
} from 'next-auth/providers/twitter'

import prisma from '~/lib/prisma'

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL

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
      authorization: {
        url: 'https://twitter.com/i/oauth2/authorize',
        params: {
          scope: 'users.read tweet.read bookmark.read offline.access', // added bookmark.read
        },
      },

      // for OAuth 1.0 : Twitter prefers this
      // clientId: process.env.TWITTER_API_KEY,
      // clientSecret: process.env.TWITTER_API_SECRET,

      profile: async (
        profile: TwitterProfile | TwitterLegacyProfile,
        tokens
      ) => {
        console.debug('Got twitter profile data', profile)
        let user: any
        if ('data' in profile) {
          // OAuth 2.0
          user = {
            id: profile.data.id,
            name: profile.data.name,
            // NOTE: E-mail is currently unsupported by OAuth 2 Twitter.
            email: null,
            username: profile.data.username,
            image: profile.data.profile_image_url,
          }
        } else {
          user = {
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

        // let's update Account model with new tokens, as next-auth library doesn't update the token
        await prisma.account.updateMany({
          where: {
            provider: 'twitter',
            providerAccountId: user.id,
            type: 'oauth',
          },
          data: tokens,
        })

        return user
      },
    })
  )
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      version: '2.0',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        url: 'https://accounts.google.com/o/oauth2/auth',
      },

      profile: async (profile: GoogleProfile, tokens) => {
        console.debug('Got google profile data', profile)
        let user: any
        user = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          username: profile.email,
          image: profile.picture,
        }

        // let's update Account model with new tokens, as next-auth library doesn't update the token
        await prisma.account.updateMany({
          where: {
            provider: 'google',
            providerAccountId: user.id,
            type: 'oauth',
          },
          data: tokens,
        })

        return user
      },
    })
  )
}

const authOptions = {
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: '/login', // Error code passed in query string as ?error=
  },
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: providers,
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
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
  const session: any = await getServerSession(ctx.req, ctx.res, authOptions)
  return session?.user
}

export { authOptions, isAuthenticatedServerSide }
