import * as React from 'react'
import { Plus, RefreshCw } from 'react-feather'

import { GhostButton } from '~/components/Button'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { SiteRole, useContextQuery } from '~/graphql/types.generated'

import { BookmarksFilterMenu } from './FilterMenu'

export function BookmarksTitlebar({ scrollContainerRef }) {
  const { data } = useContextQuery()

  const syncTwitterBookmarks = async () => {
    return await fetch('/api/twitter/sync-bookmarks', {
      method: 'POST',
      body: '{}',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
  }

  const onAddBookmarkClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent('custom.action.openAddBookmarkForm'))
  }

  function trailingAccessory() {
    return (
      <div className="flex space-x-2">
        {/* {data?.context?.userSite?.siteRole === SiteRole.Owner && (
          <GhostButton
            title="Sync Twitter Bookmarks"
            aria-label="Sync Twitter Bookmarks"
            data-cy="open-add-bookmark-dialog"
            size="small-square"
            onClick={syncTwitterBookmarks}
          >
            <RefreshCw size={16} />
          </GhostButton>
        )} */}

        <BookmarksFilterMenu />

        {data?.context?.viewer?.isAdmin && (
          <GhostButton
            title="Add bookmark"
            aria-label="Add bookmark"
            data-cy="open-add-bookmark-dialog"
            size="small-square"
            onClick={onAddBookmarkClick}
          >
            <Plus size={16} />
          </GhostButton>
        )}
      </div>
    )
  }

  return (
    <TitleBar
      scrollContainerRef={scrollContainerRef}
      title="Bookmarks"
      trailingAccessory={trailingAccessory()}
    />
  )
}
