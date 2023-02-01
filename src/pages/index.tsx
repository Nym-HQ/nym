import { SiteRole } from '@prisma/client'
import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import * as React from 'react'

import { PrimaryButton } from '~/components/Button'
import { SiteIntro } from '~/components/Home/SiteIntro'
import { Detail } from '~/components/ListDetail/Detail'
import { PoweredByNym } from '~/components/ListDetail/PoweredByNym'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { GlobalSiteContext } from '~/components/Providers/GlobalSite'
import { SignIn } from '~/components/SignIn'
import { getContext } from '~/graphql/context'
import { GET_HOME_PAGE } from '~/graphql/queries/pages'
import { GET_USER_SITES } from '~/graphql/queries/site'
import { useContextQuery, useGetSitesQuery } from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { getSiteDomain } from '~/lib/multitenancy/client'

function UserSitesList({ sites }) {
  const router = useRouter()

  const memberSites = sites?.filter(
    (site) =>
      site.siteRole === SiteRole.ADMIN || site.siteRole === SiteRole.OWNER
  )
  const visitorSites = sites?.filter((site) => site.siteRole === SiteRole.USER)

  if (!sites || sites.length == 0) {
    return (
      <div className="flex justify-center">
        <p className="dark:text-gray-200 text-gray-900">
          Create your first site
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="w-96 mb-4">
        <h3 className="text-lg font-semibold text-gray-300 mb-2 text-center">
          {' '}
          Sites you manage{' '}
        </h3>
        {memberSites.length > 0 ? (
          <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
            {memberSites.map((site, i) => (
              <li
                key={site.site.subdomain}
                className={
                  'text-base font-semibold px-6 py-2 border-b border-gray-200 w-full hover:bg-blue-600 hover:text-white' +
                  (i === 0 ? ' rounded-t-lg' : '') +
                  (i + 1 === memberSites.length ? ' rounded-b-lg' : '')
                }
              >
                <a href={`//${getSiteDomain(site.site)}`}>
                  <h4>{getSiteDomain(site.site, false)}</h4>
                  {site.site.parkedDomain && <h4>{site.site.parkedDomain}</h4>}
                  <span className="text-gray-400 text-xs font-light">
                    {site.siteRole}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base dark:text-gray-200 text-gray-900">
            You don't have your own site yet, wanna create one?
          </p>
        )}

        <div className="flex justify-center mt-4">
          <PrimaryButton
            onClick={() => {
              router.push('/create-site')
            }}
          >
            Create a new Site
          </PrimaryButton>
        </div>
      </div>
      {visitorSites.length > 0 && (
        <div className="w-96 mb-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-2 text-center">
            {' '}
            Sites you visited{' '}
          </h3>
          <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
            {visitorSites.map((site, i) => (
              <li
                key={site.site.subdomain}
                className={
                  'text-base font-semibold px-6 py-2 border-b border-gray-200 w-full hover:bg-blue-600 hover:text-white' +
                  (i === 0 ? ' rounded-t-lg' : '') +
                  (i + 1 === memberSites.length ? ' rounded-b-lg' : '')
                }
              >
                <a href={`//${getSiteDomain(site.site)}`}>
                  <h4>{getSiteDomain(site.site, false)}</h4>
                  {site.site.parkedDomain && <h4>{site.site.parkedDomain}</h4>}
                  <span className="text-gray-400 text-xs font-light">
                    {site.siteRole}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AppIntro() {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data } = useContextQuery()

  if (data?.context?.viewer) {
    const { data: userSites } = useGetSitesQuery()

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
          <div className="pb-24 space-y-8 md:space-y-12">
            <h1 className="text-primary text-center font-sans text-xl font-semibold">
              Welcome back!
            </h1>
            <div className="text-primary text-center font-medium text-gray-700 dark:text-gray-300 font-sans">
              Select a site to get started.
            </div>
          </div>
          <section>
            <UserSitesList sites={userSites?.userSites} />
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
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  const graphql = [...getCommonQueries(apolloClient)]

  let commonProps = await getCommonPageProps(ctx)
  if (!commonProps.site.isAppDomain) {
    graphql.push(apolloClient.query({ query: GET_HOME_PAGE }))
  }
  const graphqlData = await Promise.all(graphql)
  commonProps = await getCommonPageProps(ctx, graphqlData[0])
  if (!commonProps.site.isAppDomain && !commonProps.site.siteId) {
    return {
      redirect: {
        destination: '/create-your-site',
        permanent: false,
      },
    }
  }

  if (graphqlData[0].data?.context?.viewer && commonProps.site.isAppDomain) {
    await apolloClient.query({ query: GET_USER_SITES })
  }

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}
