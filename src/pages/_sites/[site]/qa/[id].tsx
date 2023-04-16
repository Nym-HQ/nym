import * as React from 'react'

import { QuestionDetail } from '~/components/AMA/QuestionDetail'
import { QuestionsList } from '~/components/AMA/QuestionsList'
import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { getContext } from '~/graphql/context'
import { GET_COMMENTS } from '~/graphql/queries/comments'
import { GET_QUESTION, GET_QUESTIONS } from '~/graphql/queries/questions'
import {
  CommentType,
  QuestionStatus,
  useContextQuery,
  useGetQuestionQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function QuestionDetailPage(props) {
  const { id } = props
  const { data: context } = useContextQuery()
  const { data, loading, error } = useGetQuestionQuery({
    variables: { id },
  })

  return (
    <QuestionDetail
      id={id}
      question={data.question}
      site={context.context.site}
      loading={loading}
      error={error}
    />
  )
}

export async function getServerSideProps(ctx) {
  const {
    params: { id },
  } = ctx

  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),

    apolloClient.query({
      query: GET_QUESTIONS,
      variables: {
        filter: { status: QuestionStatus.Answered },
      },
    }),
    apolloClient.query({
      query: GET_QUESTION,
      variables: { id },
    }),
    apolloClient.query({
      query: GET_COMMENTS,
      variables: { refId: id, type: CommentType.Question },
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
      id,
      ...commonProps,
    },
  })
}

QuestionDetailPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={<QuestionsList />} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default QuestionDetailPage
