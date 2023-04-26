/**
 * "/admin" URL will only be accessble from user subdomain (exclude preserved subdomains like "app")
 * These pages will be used to manage the user's contents on the site
 *
 */

import * as React from 'react'

import { SiteLayout } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import NewsletterSubscribers from '~/components/Newsletters/NewsletterSubscribers'
import { getContext } from '~/graphql/context'
import { useContextQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'

function AdminNewslettersPage(props) {
  const { data: context } = useContextQuery()

  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  return (
    <Detail.Container ref={scrollContainerRef}>
      <TitleBar
        title="Your subscribers"
        backButton
        globalMenu={false}
        backButtonHref={'/'}
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        magicTitle
      />

      <Detail.ContentContainer>
        <Detail.Title ref={titleRef}>Your subscribers</Detail.Title>

        <div className="pt-3">
          <NewsletterSubscribers />
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  )
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)

  // require login
  if (!context.viewer) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  // require to be admin
  if (!context.viewer.isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

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

AdminNewslettersPage.getLayout = function getLayout(page) {
  return <SiteLayout>{page}</SiteLayout>
}

export default AdminNewslettersPage
