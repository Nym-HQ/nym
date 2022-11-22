import * as React from 'react'

import { ListDetailView } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { useContextQuery } from '~/graphql/types.generated'

function MissingPage() {
  const { data } = useContextQuery()
  return (
    <Detail.Null
      type={data?.context?.userSite?.siteRole === 'ADMIN' ? 'Page' : '404'}
    />
  )
}

export default function Home() {
  return <ListDetailView list={null} hasDetail detail={<MissingPage />} />
}
