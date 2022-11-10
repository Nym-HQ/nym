import * as React from 'react'

import Button from '~/components/Button'
import { useViewerQuery } from '~/graphql/types.generated'

function getEditButton(page) {
  const { data } = useViewerQuery()

  if (!data?.viewer?.isViewerSiteAdmin) return null

  return (
    <Button href="/pages/[slug]/edit" as={`/pages/${page.slug}/edit`}>
      Edit
    </Button>
  )
}

export function PageActions({ page }) {
  return (
    <div className="flex items-center space-x-2">{getEditButton(page)}</div>
  )
}
