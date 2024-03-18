import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import Auth0Provider, { Auth0Profile } from 'next-auth/providers/auth0'
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

if (
  process.env.AUTH0_CLIENT_ID &&
  process.env.AUTH0_CLIENT_SECRET &&
  process.env.AUTH0_ISSUER_BASE_URL
) {
  providers.push(
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      // allow multiple providers for a single account
      allowDangerousEmailAccountLinking: true,
      issuer: process.env.AUTH0_ISSUER_BASE_URL,

      profile: async (profile: Auth0Profile, tokens) => {
        console.debug('Got profile data', profile)
        let user: any
        if ('data' in profile) {
          // OAuth 2.0
          user = {
            id: profile.data.id,
            name: profile.data.name,
            // NOTE: E-mail is currently unsupported by OAuth 2 Twitter.
            email: null,
            username: `T${profile.data.id}`,
            image: profile.data.profile_image_url,
          }
        } else {
          user = {
            id: profile.id_str,
            name: profile.name,
            email: (profile as any).email,
            username: `T${profile.id_str}`,
            image: profile.profile_image_url_https.replace(
              /_normal\.(jpg|png|gif)$/,
              '.$1'
            ),
          }
        }

        // let's update Account model with new tokens, as next-auth library doesn't update the token
        await prisma.account.updateMany({
          where: {
            provider: 'auth0',
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

if (
  (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) ||
  (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET)
) {
  providers.push(
    TwitterProvider({
      ...(process.env.TWITTER_OAUTH_VER == '2.0'
        ? {
            version: '2.0',
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            authorization: {
              url: 'https://twitter.com/i/oauth2/authorize',
              params: {
                scope: 'users.read tweet.read bookmark.read offline.access', // added bookmark.read
              },
            },
          }
        : {
            version: '1.0',
            clientId: process.env.TWITTER_API_KEY,
            clientSecret: process.env.TWITTER_API_SECRET,
          }),

      // allow multiple providers for a single account
      allowDangerousEmailAccountLinking: true,

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
            username: `T${profile.data.id}`,
            image: profile.data.profile_image_url,
          }
        } else {
          user = {
            id: profile.id_str,
            name: profile.name,
            email: (profile as any).email,
            username: `T${profile.id_str}`,
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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // allow multiple providers for a single account
      allowDangerousEmailAccountLinking: true,

      profile: async (profile: GoogleProfile) => {
        console.debug('Got google profile data', profile)
        let user: any = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          username: `G${profile.sub}`,
          image: profile.picture,
        }
        return user
      },
    })
  )
}

const authOptions = {
  debug: false,
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: '/login', // Error code passed in query string as ?error=
  },

  ...(typeof window === 'undefined'
    ? {
        adapter: PrismaAdapter(prisma),
      }
    : {}),

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
        } as any
      }

      return session
    },
    authorized({ auth }) {
      return !!auth?.user
    },
  },
} as NextAuthOptions

const { auth, CSRF_experimental } = NextAuth(authOptions)

export { auth, authOptions, CSRF_experimental }
