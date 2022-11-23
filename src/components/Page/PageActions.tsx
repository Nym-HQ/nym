import * as React from 'react'

import Button from '~/components/Button'
import { SiteRole, useContextQuery } from '~/graphql/types.generated'

function getEditButton(page) {
  const { data } = useContextQuery()

  if (data?.context?.userSite?.siteRole !== SiteRole.Admin) return null

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
