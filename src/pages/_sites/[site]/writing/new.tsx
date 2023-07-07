import { GetServerSideProps } from 'next/types'
import { NextSeo } from 'next-seo'
import * as React from 'react'

import { ListDetailView, SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { PostEditor } from '~/components/Writing/Editor/PostEditor'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { getContext } from '~/graphql/context'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import prisma from '~/lib/prisma'

export const config = {
  runtime: 'nodejs',
}

function NewPostPage(props) {
  const { data: context } = useContextQuery()
  const seo = extendSEO(routes.writing.seo, context.context.site)
  if (!context?.context?.viewer?.isAdmin) return <Detail.Null type="404" />
  return (
    <>
      <NextSeo {...seo} />
      <PostEditor post={null} site={context.context?.site} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const context = await getContext(ctx, prisma)
  const apolloClient = initApolloClient({ context })
  const graphqlData = await Promise.all([...getCommonQueries(apolloClient)])
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
    props: { ...commonProps },
  })
}

NewPostPage.getLayout = function getLayout(page) {
  return (
    <SiteLayout>
      <ListDetailView list={null} hasDetail detail={page} />
    </SiteLayout>
  )
}

export default NewPostPage
