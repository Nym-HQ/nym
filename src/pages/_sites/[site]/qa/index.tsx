import { GetServerSideProps } from 'next/types'
import { NextSeo } from 'next-seo'
import * as React from 'react'

import { QuestionsList } from '~/components/AMA/QuestionsList'
import { ListDetailView, SiteLayout } from '~/components/Layouts'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { GET_QUESTIONS } from '~/graphql/queries/questions'
import { QuestionStatus, useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

function AmaPage(props) {
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.ama.seo, context.context.site)

  return <NextSeo {...seo} />
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({
      query: GET_QUESTIONS,
      variables: {
        filter: { status: QuestionStatus.Answered },
      },
    }),
  ])

  const commonProps = await getCommonPageProps(ctx, graphqlData[0])
  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  return addApolloState(apolloClient, {
    props: {
      ...commonProps,
    },
  })
}

AmaPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView
        list={<QuestionsList />}
        hasDetail={false}
        detail={page}
      />
    </SiteLayout>
  )
}

export default AmaPage
