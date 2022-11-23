import { NextSeo } from 'next-seo'
import * as React from 'react'

import { UserSettings } from '~/components/UserSettings'
import routes from '~/config/routes'

export default function Profile() {
  return (
    <>
      <NextSeo
        title={routes.profile.seo.title}
        description={routes.profile.seo.description}
        openGraph={routes.profile.seo.openGraph}
      />
      <UserSettings />
    </>
  )
}
