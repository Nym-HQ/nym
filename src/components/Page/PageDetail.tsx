import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
// import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { timestampToCleanTime } from '~/lib/transformers'

import { EditorJSPreviewer } from '../EditorJS'
import { PoweredByNym } from '../ListDetail/PoweredByNym'
import { MDEditorPreviewer } from '../ReactMdEditor'
import { PageActions } from './PageActions'
import { PageSEO } from './PageSEO'

export function PageDetail({ slug, site, page, error, loading }) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const editorJsRef = React.useRef(null)

  if (loading) {
    return <Detail.Loading />
  }

  if (!page || error) {
    return <Detail.Null type="Page" />
  }

  if (editorJsRef.current != null) {
    editorJsRef.current.render(page.data)
  }

  const publishedAt = timestampToCleanTime({ timestamp: page.publishedAt })
  return (
    <>
      {page && <PageSEO page={page} site={site} />}
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

        <div className="flex flex-1 flex-col flex-start justify-start">
          <Detail.ContentContainer>
            <Detail.Header
              style={{
                maxWidth: '650px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <Detail.Title ref={titleRef}>{page.title}</Detail.Title>
              {publishedAt && (
                <span
                  title={publishedAt.raw}
                  className="text-tertiary inline-block leading-snug"
                >
                  {publishedAt.formatted}
                </span>
              )}
            </Detail.Header>

            {page.text && !page.data?.blocks ? (
              <div className="mt-8">
                <MDEditorPreviewer source={page.text} />
              </div>
            ) : (
              <EditorJSPreviewer
                value={page.data}
                editorRef={(el) => {
                  editorJsRef.current = el
                }}
              />
            )}
            {/* <MarkdownRenderer children={page.text} className="prose" /> */}

            {/* bottom padding to give space between page content and comments */}
            <div className="py-6" />
          </Detail.ContentContainer>
        </div>

        <PoweredByNym scrollContainerRef={scrollContainerRef} />
      </Detail.Container>
    </>
  )
}
