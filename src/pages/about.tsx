import * as React from 'react'

import { ListDetailView } from '~/components/Layouts'

function AboutComponent() {
  return <div></div>
}

export default function About() {
  return <ListDetailView list={null} hasDetail detail={<AboutComponent />} />
}
