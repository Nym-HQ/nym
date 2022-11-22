import * as React from 'react'
import { Plus, Radio } from 'react-feather'

import Button, { GhostButton } from '~/components/Button'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { useContextQuery } from '~/graphql/types.generated'

import { DialogComponent } from '../Dialog'
import SegmentedControl from '../SegmentedController'
import { PageContext } from './PagesList'
import { PageSubscriptionForm } from './SubscriptionForm'

export function PageTitlebar({ scrollContainerRef }) {
  const { data } = useContextQuery()
  console.log('viewer query data', data)

  function getAddButton() {
    if (data?.context?.userSite?.siteRole === 'ADMIN') {
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

  function getSubscribeButton() {
    if (data?.context?.userSite?.siteRole === 'ADMIN') return null
    return (
      <DialogComponent
        title="Newsletter"
        trigger={
          <Button data-cy="open-subscribe-hn-dialog" size="small">
            <Radio size={16} />
            <span>Subscribe</span>
          </Button>
        }
        modalContent={() => <PageSubscriptionForm />}
      />
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
    const { setFilter, filter } = React.useContext(PageContext)
    if (data?.context?.userSite?.siteRole === 'ADMIN') {
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
