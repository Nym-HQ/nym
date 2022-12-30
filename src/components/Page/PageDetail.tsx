import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
// import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { timestampToCleanTime } from '~/lib/transformers'

import { EditorJSPreviewer } from '../EditorJS'
import { MDEditorPreviewer } from '../ReactMdEditor'
import { PageActions } from './PageActions'
import { PageSEO } from './PageSEO'

export function PageDetail({ slug, site, page, error, loading }) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)

  if (loading) {
    return <Detail.Loading />
  }

  if (!page || error) {
    return <Detail.Null type="Page" />
  }

  const publishedAt = timestampToCleanTime({ timestamp: page.publishedAt })
  return (
    <>
      <PageSEO page={page} site={site} />
      <Detail.Container data-cy="page-detail" ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/pages'}
          magicTitle
          title={page.title}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          trailingAccessory={<PageActions page={page} />}
        />

        <Detail.ContentContainer>
          <Detail.Header>
            <Detail.Title ref={titleRef}>{page.title}</Detail.Title>
            <span
              title={publishedAt.raw}
              className="text-tertiary inline-block leading-snug"
            >
              {publishedAt.formatted}
            </span>
          </Detail.Header>

          {page.text && !page.data?.blocks ? (
            <div className="mt-8">
              <MDEditorPreviewer source={page.text} />
            </div>
          ) : (
            <EditorJSPreviewer value={page.data} />
          )}
          {/* <MarkdownRenderer children={page.text} className="prose" /> */}

          {/* bottom padding to give space between page content and comments */}
          <div className="py-6" />
        </Detail.ContentContainer>
      </Detail.Container>
    </>
  )
}
