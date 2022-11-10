import * as React from 'react'

import { ListItem } from '~/components/ListDetail/ListItem'
import { Page } from '~/graphql/types.generated'
import { timestampToCleanTime } from '~/lib/transformers'

interface Props {
  page: Page
  active: boolean
}

export const PageListItem = React.memo<Props>(({ page, active }) => {
  const publishedAt = timestampToCleanTime({ timestamp: page.publishedAt })
  return (
    <ListItem
      key={page.id}
      href="/pages/[slug]"
      as={`/pages/${page.slug}`}
      title={page.title}
      description={null}
      byline={page.publishedAt ? publishedAt.formatted : 'Draft'}
      active={active}
    />
  )
})
