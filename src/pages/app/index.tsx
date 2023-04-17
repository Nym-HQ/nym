import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import * as React from 'react'

import { PrimaryButton } from '~/components/Button'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { SignIn } from '~/components/SignIn'
import { getContext } from '~/graphql/context'
import { GET_USER_SITES } from '~/graphql/queries/site'
import {
  SiteRole,
  useContextQuery,
  useGetSitesQuery,
} from '~/graphql/types.generated'
import { addApolloState, initApolloClient } from '~/lib/apollo'
import { getCommonQueries } from '~/lib/apollo/common'
import { getCommonPageProps } from '~/lib/commonProps'
import { getSiteDomain, MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

function UserSitesList({ sites }) {
  const router = useRouter()

  const memberSites = sites?.filter(
    (site) =>
      site.siteRole === SiteRole.Admin || site.siteRole === SiteRole.Owner
  )
  const visitorSites = sites?.filter((site) => site.siteRole === SiteRole.User)

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
            {memberSites.map((site, i) => {
              const siteUrl = `${
                typeof window !== 'undefined'
                  ? window.location.protocol
                  : 'https:'
              }//${getSiteDomain(site.site)}`

              return (
                <li
                  key={site.site.subdomain}
                  className={
                    'text-base font-semibold px-6 py-2 border-b border-gray-200 w-full hover:bg-blue-600 hover:text-white' +
                    (i === 0 ? ' rounded-t-lg' : '') +
                    (i + 1 === memberSites.length ? ' rounded-b-lg' : '')
                  }
                >
                  <a
                    href={siteUrl}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      location.href = `/signin-complete?next=${encodeURIComponent(
                        siteUrl
                      )}`
                    }}
                  >
                    <h4>{getSiteDomain(site.site, false)}</h4>
                    {site.site.parkedDomain && (
                      <h4>{site.site.parkedDomain}</h4>
                    )}
                    <span className="text-gray-400 text-xs font-light">
                      {site.siteRole}
                    </span>
                  </a>
                </li>
              )
            })}
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

export default function Home(props) {
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

export async function getServerSideProps(ctx: NextPageContext) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  let graphqlData = await Promise.all(getCommonQueries(apolloClient))

  let commonProps = await getCommonPageProps(ctx, graphqlData[0])

  if (graphqlData[0].data?.context?.viewer) {
    const userSites = await apolloClient.query({ query: GET_USER_SITES })

    const resolvedUrl = (ctx as any).resolvedUrl
    const url = new URL(resolvedUrl, `https://${MAIN_APP_DOMAIN}`)

    // Bookmarklet redirect
    if (
      url.searchParams.get('next') &&
      url.searchParams.get('next').startsWith('/bookmarks')
    ) {
      const nextUrl = new URL(url.searchParams.get('next'), url)

      try {
        const bookmarkUrl = new URL(nextUrl.searchParams.get('url'))
        const sites = userSites.data.userSites
          .filter((userSite) => userSite.siteRole === SiteRole.Owner)
          .map((userSite) => userSite.site)
        if (sites.length > 1) {
          // if the user has multiple owned sites, go to the site selector
          return {
            redirect: {
              destination: `/bookmarks?url=${bookmarkUrl}`,
              permanent: false,
            },
          }
        } else if (sites.length === 1) {
          // if the user has just one site, redirect to it directly
          const siteDomain = getSiteDomain(sites[0])
          return {
            redirect: {
              destination: `/signin-complete?next=${encodeURIComponent(
                `https://${siteDomain}/bookmarks/add?url=${bookmarkUrl}`
              )}`,
              permanent: false,
            },
          }
        } else {
          console.warn(
            'Bookmarking shortcut accessed, but the user has now site owned'
          )
        }
      } catch {
        console.warn('Invalid Bookmark URL: ', nextUrl.searchParams.get('url'))
      }
    }
  }

  return addApolloState(apolloClient, {
    props: { ...commonProps },
  })
}