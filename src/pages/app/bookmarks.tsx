import Link from 'next/link'
import { NextSeo } from 'next-seo'
import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
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

function AddBookmarkSiteList({ ownedSites, bookmarkUrl }) {
  if (!ownedSites || ownedSites.length == 0) {
    return (
      <div className="flex justify-center">
        <p className="dark:text-gray-200 text-gray-900">
          You don't own a site yet.{' '}
          <Link href={'/create-site'}>
            <a>Create one?</a>
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="w-96 mb-4">
        <h3 className="text-lg font-semibold text-gray-300 mb-2 text-center">
          Choose a site to add the new bookmark to
        </h3>
        <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
          {ownedSites.map((site, i) => {
            const siteUrl = `${
              typeof window !== 'undefined'
                ? window.location.protocol
                : 'https://'
            }//${getSiteDomain(
              site.site
            )}/bookmarks/add?url=${encodeURIComponent(bookmarkUrl)}`

            return (
              <li
                key={site.site.subdomain}
                className={
                  'text-base font-semibold px-6 py-2 border-b border-gray-200 w-full hover:bg-blue-600 hover:text-white' +
                  (i === 0 ? ' rounded-t-lg' : '') +
                  (i + 1 === ownedSites.length ? ' rounded-b-lg' : '')
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
                  {site.site.parkedDomain && <h4>{site.site.parkedDomain}</h4>}
                  <span className="text-gray-400 text-xs font-light">
                    {site.siteRole}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function BookmarksPage(props) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data: context } = useContextQuery()
  const { data } = useGetSitesQuery()

  const seo = extendSEO(routes.bookmarks.seo, context.context.site)
  const ownedSites = data.userSites?.filter(
    (site) => site.siteRole === SiteRole.Owner
  )
  const currentUrl = new URL(
    typeof window !== 'undefined'
      ? window.location.href
      : `https://${MAIN_APP_DOMAIN}`
  )
  const bookmarkUrl = currentUrl.searchParams.get('url') || ''

  return (
    <>
      <NextSeo {...seo} />

      <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
        <TitleBar
          magicTitle
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          title="Add Bookmark"
        />

        {/* Keep this div to trigger the magic scroll */}
        <div className="p-4" ref={titleRef} />

        <Detail.ContentContainer>
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="w-96 mb-4">
              <AddBookmarkSiteList
                ownedSites={ownedSites}
                bookmarkUrl={bookmarkUrl}
              />
            </div>
          </div>
        </Detail.ContentContainer>
      </Detail.Container>
    </>
  )
}

export async function getServerSideProps(ctx) {
  const context = await getContext(ctx)
  const apolloClient = initApolloClient({ context })

  let graphqlData = await Promise.all([
    ...getCommonQueries(apolloClient),
    apolloClient.query({ query: GET_USER_SITES }),
  ])
  const commonProps = await getCommonPageProps(ctx, graphqlData[0])

  return addApolloState(apolloClient, {
    props: {
      ...commonProps,
    },
  })
}

export default BookmarksPage
