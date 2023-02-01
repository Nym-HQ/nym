import { NextSeo } from 'next-seo'
import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import routes from '~/config/routes'
import { extendSEO } from '~/config/seo'
import { useContextQuery, useGetHomePageQuery } from '~/graphql/types.generated'
import { parsePageData } from '~/lib/compat/data'

import { EditorJSPreviewer } from '../EditorJS'
import { PoweredByNym } from '../ListDetail/PoweredByNym'
import { MarkdownRenderer } from '../MarkdownRenderer'
import { MDEditorPreviewer } from '../ReactMdEditor'

export function SiteIntro() {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data: context } = useContextQuery()
  const { data } = useGetHomePageQuery()

  const homepage = parsePageData(data?.homepage)

  const seo = extendSEO(
    {
      ...routes.home.seo,
    },
    context.context.site
  )
  return (
    <>
      <NextSeo {...seo} />
      {data?.homepage ? (
        <Detail.Container data-cy="home-intro" ref={scrollContainerRef}>
          <TitleBar
            magicTitle
            titleRef={titleRef}
            scrollContainerRef={scrollContainerRef}
            title="Home"
          />
          
          <div className="flex flex-1 flex-col flex-start justify-start">
            <Detail.ContentContainer>
              <div>
                <span
                  title={data.homepage.publishedAt.raw}
                  className="text-tertiary inline-block leading-snug"
                >
                  {data.homepage.publishedAt.formatted}
                </span>

                {homepage.text && !homepage.data?.blocks ? (
                  <div className="mt-8">
                    <MDEditorPreviewer source={homepage.text} />
                  </div>
                ) : (
                  <EditorJSPreviewer value={homepage.data} />
                )}
                {/* <MarkdownRenderer children={homepage.text} className="prose" /> */}
              </div>
            </Detail.ContentContainer>
          </div>

          <PoweredByNym scrollContainerRef={scrollContainerRef} />
        </Detail.Container>
      ) : (
        <Detail.Null type="Page" />
      )}
    </>
  )
}
