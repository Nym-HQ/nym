import * as React from 'react'
import { Plus } from 'react-feather'

import { GhostButton } from '~/components/Button'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { SiteRole, useContextQuery } from '~/graphql/types.generated'

import { AddBookmarkDialog } from './AddBookmarkDialog'
import { BookmarksFilterMenu } from './FilterMenu'

export function BookmarksTitlebar({ scrollContainerRef }) {
  const { data } = useContextQuery()

  function getAddButton() {
    if (data?.context?.viewer?.isAdmin) {
      return (
        <AddBookmarkDialog
          trigger={
            <GhostButton
              aria-label="Add bookmark"
              data-cy="open-add-bookmark-dialog"
              size="small-square"
            >
              <Plus size={16} />
            </GhostButton>
          }
        />
      )
    }
    return null
  }

  function trailingAccessory() {
    return (
      <div className="flex space-x-2">
        <BookmarksFilterMenu />
        {getAddButton()}
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
