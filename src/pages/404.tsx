import * as React from 'react'

import { ListDetailView } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { useViewerQuery } from '~/graphql/types.generated'

function MissingPage() {
  const { data } = useViewerQuery()
  return <Detail.Null type={data?.viewer?.isViewerSiteAdmin ? 'Page' : '404'} />
}

export default function Home() {
  return <ListDetailView list={null} hasDetail detail={<MissingPage />} />
}
