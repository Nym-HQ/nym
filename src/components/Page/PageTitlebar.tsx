import * as React from 'react'
import { Plus } from 'react-feather'

import { GhostButton } from '~/components/Button'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { useContextQuery } from '~/graphql/types.generated'

import SegmentedControl from '../SegmentedController'
import { PageContext } from './PagesList'

export function PageTitlebar({ scrollContainerRef }) {
  const { data } = useContextQuery()

  function getAddButton() {
    if (data?.context?.viewer?.isAdmin) {
      return (
        <GhostButton
          href="/pages/new"
          data-cy="new-page-button"
          size="small-square"
          aria-label="Add page"
        >
          <Plus size={16} />
        </GhostButton>
      )
    }
    return null
  }

  function trailingAccessory() {
    return (
      <div className="flex space-x-2">
        {getAddButton()}
      </div>
    )
  }

  function getChildren() {
    const { data } = useContextQuery()
    const { setFilter, filter } = React.useContext(PageContext)
    if (data?.context?.viewer?.isAdmin) {
      return (
        <div className="pt-2 pb-1">
          <SegmentedControl
            onSetActiveItem={setFilter}
            active={filter}
            items={[
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Drafts' },
            ]}
          />
        </div>
      )
    }
    return null
  }

  return (
    <TitleBar
      trailingAccessory={trailingAccessory()}
      title="Page"
      scrollContainerRef={scrollContainerRef}
    >
      {getChildren()}
    </TitleBar>
  )
}
