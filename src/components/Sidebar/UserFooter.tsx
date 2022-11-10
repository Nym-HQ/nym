import Link from 'next/link'
import Router from 'next/router'
import * as React from 'react'
import { Settings } from 'react-feather'

import { Avatar } from '~/components/Avatar'
import { GhostButton } from '~/components/Button'
import { LoadingSpinner } from '~/components/LoadingSpinner'
import { GlobalNavigationContext } from '~/components/Providers/GlobalNavigation'
import { useViewerQuery } from '~/graphql/types.generated'
import { MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

function Container(props) {
  return (
    <div
      data-cy="sign-in-button"
      className="filter-blur sticky bottom-0 z-10 flex items-center justify-between space-x-3 border-t border-gray-150 bg-white bg-opacity-80 p-2 dark:border-gray-800 dark:bg-gray-900 dark:bg-opacity-60"
      {...props}
    />
  )
}

export function UserFooter() {
  const { data, loading, error } = useViewerQuery()
  const { setIsOpen } = React.useContext(GlobalNavigationContext)

  const getSignInUrl = () => {
    const url = new URL(window.location.href)
    if (url.host != MAIN_APP_DOMAIN) {
      return `http://${MAIN_APP_DOMAIN}/signin?redirect=true&next=${encodeURIComponent(
        window.location.href
      )}`
    } else if (url.pathname != '/signin') {
      return `/signin?redirect=true&next=${encodeURIComponent(
        window.location.href
      )}`
    } else {
      return window.location.href
    }
  }

  function signInButton() {
    return (
      <GhostButton
        onClick={() => Router.push(getSignInUrl())}
        style={{ width: '100%' }}
      >
        Sign in
      </GhostButton>
    )
  }

  if (loading) {
    return (
      <Container>
        <div className="flex w-full items-center justify-center py-1">
          <LoadingSpinner />
        </div>
      </Container>
    )
  }

  if (error) {
    return <Container>{signInButton()}</Container>
  }

  if (data?.viewer) {
    return (
      <Container>
        <Link href={`/u/${data.viewer.username}`}>
          <a
            onClick={() => setIsOpen(false)}
            className="flex flex-none items-center rounded-full"
          >
            <Avatar
              user={data.viewer}
              src={data.viewer.avatar}
              width={24}
              height={24}
              layout="fixed"
              className="rounded-full"
            />
          </a>
        </Link>
        <GhostButton
          aria-label="Manage settings"
          onClick={() => setIsOpen(false)}
          size="small-square"
          href="/settings"
        >
          <Settings size={16} />
        </GhostButton>
      </Container>
    )
  }

  return <Container>{signInButton()}</Container>
}
