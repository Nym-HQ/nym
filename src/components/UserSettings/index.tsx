import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { useGetViewerWithSettingsQuery } from '~/graphql/types.generated'

import { PoweredByNym } from '../ListDetail/PoweredByNym'
import { EmailForm } from './Email'
import { EmailPreferences } from './EmailPreferences'
import { UserSettingsFooter } from './Footer'
import { SignedOut } from './SignedOut'
import { UsernameForm } from './Username'

export function UserSettings() {
  const { data, loading } = useGetViewerWithSettingsQuery({
    fetchPolicy: 'network-only',
  })

  const titleRef = React.useRef(null)
  const scrollContainerRef = React.useRef(null)

  if (!data?.context?.viewer && loading) {
    return <Detail.Loading />
  }

  if (!data?.context?.viewer) {
    return <SignedOut />
  }

  return (
    <Detail.Container ref={scrollContainerRef}>
      <TitleBar
        magicTitle
        title={'Profile Settings'}
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
      />

      <Detail.ContentContainer>
        <Detail.Header>
          <Detail.Title ref={titleRef}>Profile Settings</Detail.Title>
        </Detail.Header>

        <div className="divide-y divide-gray-200 py-12 dark:divide-gray-800">
          <div className="space-y-8 py-12">
            <h3 className="text-primary text-lg font-bold">Account</h3>
            <EmailForm viewer={data?.context?.viewer} />
            <UsernameForm viewer={data?.context?.viewer} />
          </div>

          {/* {data?.context?.viewer.email && (
            <div className="space-y-8 py-12">
              <h3 className="text-primary text-lg font-bold">Emails</h3>
              <EmailPreferences viewer={data?.context?.viewer} />
            </div>
          )} */}

          <UserSettingsFooter />
        </div>
      </Detail.ContentContainer>

      <PoweredByNym />
    </Detail.Container>
  )
}
