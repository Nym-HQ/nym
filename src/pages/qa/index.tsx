import { NextSeo } from 'next-seo'
import * as React from 'react'

import { QuestionsList } from '~/components/AMA/QuestionsList'
import { ListDetailView, SiteLayout } from '~/components/Layouts'
import routes from '~/config/routes'
import { getContext } from '~/graphql/context'
import { GET_QUESTIONS } from '~/graphql/queries/questions'
import { QuestionStatus } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function AmaPage(props) {
  return (
    <NextSeo
      title={routes.ama.seo.title}
      description={routes.ama.seo.description}
      openGraph={routes.ama.seo.openGraph}
    />
  )
}

export async function getServerSideProps(ctx) {
  const { req, res } = ctx

  const commonProps = await getCommonPageProps(ctx)
  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({
      query: GET_QUESTIONS,
      variables: {
        filter: { status: QuestionStatus.Answered },
      },
    }),
  ])

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
