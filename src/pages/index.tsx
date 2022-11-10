import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import * as React from 'react'

import { PrimaryButton } from '~/components/Button'
import { SiteIntro } from '~/components/Home/SiteIntro'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { GlobalSiteContext } from '~/components/Providers/GlobalSite'
import { SignIn } from '~/components/SignIn'
import { getContext } from '~/graphql/context'
import { GET_HOME_PAGE } from '~/graphql/queries/pages'
import { GET_USER_SITES } from '~/graphql/queries/site'
import { useGetSitesQuery, useViewerQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { getSiteDomain } from '~/lib/multitenancy/client'

function UserSitesList({ sites }) {
  return sites && sites.length > 0 ? (
    <div className="flex justify-center">
      <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
        {sites.map((site, i) => (
          <li
            key={site.site.subdomain}
            className={
              'text-base font-semibold px-6 py-2 border-b border-gray-200 w-full hover:bg-blue-600 hover:text-white' +
              (i === 0 ? ' rounded-t-lg' : '') +
              (i + 1 === sites.length ? ' rounded-b-lg' : '')
            }
          >
            <a href={`//${getSiteDomain(site.site)}`}>
              <h4>{getSiteDomain(site, false)}</h4>
              {site.site.parkedDomain && <h4>{site.site.parkedDomain}</h4>}
              <span className="text-gray-400 text-xs font-light">
                {site.siteRole}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div className="flex justify-center">
      <p className="dark:text-gray-200 text-gray-900">Create your first site</p>
    </div>
  )
}

function AppIntro() {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data: viewerData } = useViewerQuery()
  const router = useRouter()

  if (viewerData?.viewer) {
    const { data } = useGetSitesQuery()

    return (
      <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
        <TitleBar
          magicTitle
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          title="Home"
        />

        {/* Keep this div to trigger the magic scroll */}
        <div className="p-4" ref={titleRef} />

        <Detail.ContentContainer>
          <div className="pb-24 space-y-8 md:space-y-16">
            <h1 className="text-primary text-center font-sans text-xl font-semibold">
              Welcome back!
            </h1>
            <div className="text-primary text-center font-medium text-gray-700 dark:text-gray-300 font-sans">
              Select a site to get started.
            </div>
          </div>
          <section>
            <UserSitesList sites={data?.userSites} />
            <div className="flex justify-center mt-4">
              <PrimaryButton
                onClick={() => {
                  router.push('/create-site')
                }}
              >
                Add new Site
              </PrimaryButton>
            </div>
          </section>
        </Detail.ContentContainer>
      </Detail.Container>
    )
  } else {
    return <SignIn />
  }
}

export default function Home(props) {
  const { isAppDomain } = React.useContext(GlobalSiteContext)

  return isAppDomain ? <AppIntro /> : <SiteIntro />
}

export async function getServerSideProps(ctx: NextPageContext) {
  const commonProps = await getCommonPageProps(ctx)
  const { res } = ctx

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

  const graphql = [...getCommonQueries(apolloClient)]
  if (!commonProps.site.isAppDomain) {
    graphql.push(apolloClient.query({ query: GET_HOME_PAGE }))
  }
  const commonQuries = await Promise.all(graphql)

  if (commonQuries[1].data?.viewer && commonProps.site.isAppDomain) {
    await apolloClient.query({ query: GET_USER_SITES })
  }

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}
