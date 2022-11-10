import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'

import { TwitterIcon } from '../Icon'

export function SignedOut() {
  return (
    <Detail.Container>
      <TitleBar title="Settings" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>You are now signed out.</p>
      </div>
    </Detail.Container>
  )
}
