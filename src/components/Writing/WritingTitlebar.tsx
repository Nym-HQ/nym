import * as React from 'react'
import { Plus, Radio } from 'react-feather'

import Button, { GhostButton } from '~/components/Button'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { useContextQuery } from '~/graphql/types.generated'

import { GlobalNavigationContext } from '../Providers/GlobalNavigation'
import SegmentedControl from '../SegmentedController'
import { WritingContext } from './PostsList'

export function WritingTitlebar({ scrollContainerRef }) {
  const { data } = useContextQuery()
  const { setSubscribeFormOpen } = React.useContext(GlobalNavigationContext)

  function getAddButton() {
    if (data?.context?.viewer?.isAdmin) {
      return (
        <GhostButton
          href="/writing/new"
          data-cy="new-post-button"
          size="small-square"
          aria-label="Add post"
        >
          <Plus size={16} />
        </GhostButton>
      )
    }
    return null
  }

  function getSubscribeButton() {
    return (
      <Button
        data-cy="open-subscribe-hn-dialog"
        size="small"
        onClick={() => {
          setSubscribeFormOpen(true)
        }}
      >
        <Radio size={16} />
        <span>Subscribe</span>
      </Button>
    )
  }

  function trailingAccessory() {
    return (
      <div className="flex space-x-2">
        {getSubscribeButton()}
        {getAddButton()}
      </div>
    )
  }

  function getChildren() {
    const { data } = useContextQuery()
    const { setFilter, filter } = React.useContext(WritingContext)
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
      title="Writing"
      scrollContainerRef={scrollContainerRef}
    >
      {getChildren()}
    </TitleBar>
  )
}
