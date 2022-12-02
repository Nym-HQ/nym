import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { useGetHomePageQuery } from '~/graphql/types.generated'

import { MarkdownRenderer } from '../MarkdownRenderer'
import { MDEditorPreviewer } from '../ReactMdEditor'

export function SiteIntro() {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data } = useGetHomePageQuery()

  return data?.homepage ? (
    <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
      <TitleBar
        magicTitle
        titleRef={titleRef}
        scrollContainerRef={scrollContainerRef}
        title="Home"
      />

      {/* Keep this div to trigger the magic scroll */}
      <div className="p-4" ref={titleRef} />

      <Detail.ContentContainer>
        <div>
          <span
            title={data.homepage.publishedAt.raw}
            className="text-tertiary inline-block leading-snug"
          >
            {data.homepage.publishedAt.formatted}
          </span>

          <div className="mt-8">
            <MDEditorPreviewer source={data.homepage.text} />
          </div>
          {/* <MarkdownRenderer children={data.homepage.text} className="prose" /> */}
        </div>
      </Detail.ContentContainer>
    </Detail.Container>
  ) : (
    <Detail.Null type="Page" />
  )
}
