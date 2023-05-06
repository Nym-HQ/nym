import { PAGINATION_AMOUNT } from '~/graphql/constants'
import { Context } from '~/graphql/context'
import { GetEmailSubscriptionsQueryVariables } from '~/graphql/types.generated'
import { isUserSite } from '~/lib/multitenancy/server'

export async function getEmailSubscriptions(
  _,
  args: GetEmailSubscriptionsQueryVariables,
  ctx: Context
) {
  const { first = PAGINATION_AMOUNT, after = undefined } = args
  const { prisma, site } = ctx

  if (!isUserSite(site)) {
    return null
  }

  /*
    When we are paginating after a cursor, we need to skip the cursor object itself. 
    Ref https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination
  */
  const skip = after ? 1 : 0
  const cursor = after ? { id: after } : undefined // TODO: support cursor-based pagination

  /*
    Not sure how to handle combined filters, but for now we can essentially 
    switch-case the filter argument and replace the `where` object in our
    findMany call.
  */
  let where = {
    siteId: site.id,
  }

  /*
    In order to know if there are more results in the database for the `hasNextPage`
    field, we overfetch by one. If we return more than the amount we requested,
    then we know there are more results.
  */
  const take = first + 1

  try {
    const edges = await prisma.emailSubscription.findMany({
      take,
      skip,
      cursor,
      where,
      orderBy: { email: 'asc' },
    })

    // If we overfetched, then we know there are more results
    const hasNextPage = edges.length > first
    // Remove the last item so we only return the requested `first` amount
    const trimmedEdges = hasNextPage ? edges.slice(0, -1) : edges
    const edgesWithNodes = trimmedEdges.map((edge) => ({
      cursor: edge.email,
      node: edge,
    }))

    return {
      pageInfo: {
        hasNextPage,
        totalCount: await prisma.emailSubscription.count({ where }),
        endCursor: edgesWithNodes[edgesWithNodes.length - 1].cursor,
      },
      edges: edgesWithNodes,
    }
  } catch (e) {
    console.error({ error: e })
    return {
      pageInfo: {
        hasNextPage: false,
        totalCount: 0,
        endCursor: null,
      },
      edges: [],
    }
  }
}
