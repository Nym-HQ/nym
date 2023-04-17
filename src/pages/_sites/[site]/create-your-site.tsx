import * as React from 'react'

import { PrimaryButton } from '~/components/Button'
import { ListDetailView } from '~/components/Layouts'
import { Detail } from '~/components/ListDetail/Detail'
import { PoweredByNym } from '~/components/ListDetail/PoweredByNym'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { MAIN_APP_DOMAIN } from '~/lib/multitenancy/client'

function CreateYourSite() {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  return (
    <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
      <TitleBar
        magicTitle
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        title="Lets get started"
      />

      <div className="p-4" ref={titleRef} />

      <div className="flex flex-1 flex-col items-center justify-center">
        <Detail.ContentContainer>
          <div className="pb-24 space-y-8 md:space-y-16">
            <h2 className="text-primary font-sans text-xl font-semibold">
              Let&rsquo;s get started{' '}
            </h2>
            <PrimaryButton
              onClick={() =>
                (window.location.href = `//${MAIN_APP_DOMAIN}/signin`)
              }
            >
              Create Site &gt;&gt;
            </PrimaryButton>
          </div>
        </Detail.ContentContainer>
      </div>

      <PoweredByNym scrollContainerRef={scrollContainerRef} />
    </Detail.Container>
  )
}

function CreateYourWebsitePage() {
  return <ListDetailView list={null} hasDetail detail={<CreateYourSite />} />
}

export default CreateYourWebsitePage
