import { AuthenticationError } from 'apollo-server-micro'

export function requiresSiteAdmin(fn) {
  return function resolve(parent, args, context) {
    if (context?.viewer?.isAdmin || context?.viewer?.isViewerSiteAdmin) {
      return fn(parent, args, context)
    }

    throw new AuthenticationError('You can’t do that!')
  }
}
