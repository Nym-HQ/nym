import Link from 'next/link'

import { SiteRole, useGetSitesQuery } from '~/graphql/types.generated'
import { getSiteDomain } from '~/lib/multitenancy/client'

export default function AddBookmarkSiteList() {
  const currentUrl = new URL(window.location.href)
  const bookmarkUrl = currentUrl.searchParams.get('url') || ''

  const { data } = useGetSitesQuery()
  const sites = data.userSites

  const ownedSites = sites?.filter((site) => site.siteRole === SiteRole.Owner)

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
            const siteUrl = `${window.location.protocol}//${getSiteDomain(
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
