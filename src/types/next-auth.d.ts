import { UserRole } from '~/graphql/types.generated'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: UserRole
    } & DefaultSession['user']
  }
}
