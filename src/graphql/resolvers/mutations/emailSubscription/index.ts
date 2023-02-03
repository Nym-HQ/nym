import { ApolloServerErrorCode } from '@apollo/server/errors'
import { GraphQLError } from 'graphql'

import { Context } from '~/graphql/context'
import {
  EmailSubscriptionType,
  MutationEditEmailSubscriptionArgs,
} from '~/graphql/types.generated'
import { getNewsletterProvider } from '~/lib/newsletter'
import { validEmail } from '~/lib/validators'

export async function editEmailSubscription(
  _,
  args: MutationEditEmailSubscriptionArgs,
  ctx: Context
) {
  const { data } = args
  const { subscribed, type = EmailSubscriptionType.Newsletter, email } = data
  const { prisma, viewer, site, owner } = ctx

  if (!viewer?.email && !email) {
    throw new GraphQLError('No email', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }

  if (email && !validEmail(email)) {
    throw new GraphQLError('Invalid email', {
      extensions: {
        code: ApolloServerErrorCode.BAD_REQUEST,
      },
    })
  }

  const emailToUse = email || (viewer && viewer.email)
  if (subscribed) {
    try {
      let existingSubscription = await prisma.emailSubscription.findFirst({
        where: {
          email: emailToUse,
          type: type,
          siteId: site.id,
        },
      })
      if (!existingSubscription) {
        await prisma.emailSubscription.create({
          data: {
            email: emailToUse,
            type: type,
            userId: viewer?.id,
            siteId: site.id,
          },
        })

        // Add subscriber to the provider
        if (type === EmailSubscriptionType.Newsletter) {
          console.log('Adding subscriber to newletter provider')
          const provider = await getNewsletterProvider(ctx)

          if (provider) {
            await provider.addSubscriber({ email: emailToUse })
          }
        }
      }
    } catch (err) {
      console.error({ err })
      // nothing to do here
    }
  } else {
    try {
      await prisma.emailSubscription.delete({
        where: {
          emailAndType: {
            email: emailToUse,
            type: type,
            siteId: site.id,
          },
        },
      })

      // Add subscriber to the provider
      if (type === EmailSubscriptionType.Newsletter) {
        console.log('Removing subscriber from newletter provider')
        const provider = await getNewsletterProvider(ctx)

        if (provider) {
          provider.removeSubscriber({ email: emailToUse })
        }
      }
    } catch (err) {
      console.error({ err })
      // nothing to do here
    }
  }

  return viewer
    ? await prisma.user.findUnique({ where: { id: viewer.id } })
    : null
}
