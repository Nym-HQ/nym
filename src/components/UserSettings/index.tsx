import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import {
  useContextQuery,
  useGetViewerWithSettingsQuery,
} from '~/graphql/types.generated'

import { PoweredByNym } from '../ListDetail/PoweredByNym'
import { EmailForm } from './Email'
import { EmailPreferences } from './EmailPreferences'
import { UserSettingsFooter } from './Footer'
import { NameForm } from './NameForm'
import { SignedOut } from './SignedOut'
import { UsernameForm } from './Username'

export function UserSettings() {
  const { data, loading } = useGetViewerWithSettingsQuery({
    fetchPolicy: 'network-only',
  })
  const { data: contextData } = useContextQuery()
  const context = contextData?.context

  const titleRef = React.useRef(null)
  const scrollContainerRef = React.useRef(null)

  if (!context?.viewer && loading) {
    return <Detail.Loading />
  }

  if (!context?.viewer) {
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

      <div className="flex flex-1 flex-col flex-start justify-start">
        <Detail.ContentContainer>
          <Detail.Header>
            <Detail.Title ref={titleRef}>Profile Settings</Detail.Title>
          </Detail.Header>

          <div className="divide-y divide-gray-200 py-12 dark:divide-gray-800">
            <div className="space-y-8 py-12">
              <h3 className="text-primary text-lg font-bold">Account</h3>
              <EmailForm viewer={context?.viewer} />
              <UsernameForm viewer={context?.viewer} />
              <NameForm viewer={context?.viewer} />
            </div>

            {context?.viewer.email && (
              <div className="space-y-8 py-12">
                <h3 className="text-primary text-lg font-bold">Emails</h3>
                <EmailPreferences
                  viewer={context?.viewer}
                  newsletterDescription={context?.site?.newsletter_description}
                  doubleOptin={context?.site?.newsletter_double_optin}
                />
              </div>
            )}

            <UserSettingsFooter />
          </div>
        </Detail.ContentContainer>
      </div>

      <PoweredByNym scrollContainerRef={scrollContainerRef} />
    </Detail.Container>
  )
}
