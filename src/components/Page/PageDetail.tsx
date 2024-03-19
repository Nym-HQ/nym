import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import { timestampToCleanTime } from '~/lib/transformers'

import { EditorJSEditor } from '../EditorJS'
import { Paywall } from '../ListDetail/Paywall'
import { PoweredByNym } from '../ListDetail/PoweredByNym'
import { MarkdownRenderer } from '../MarkdownRenderer'
import { PageActions } from './PageActions'
import { PageSEO } from './PageSEO'
import useCustomHistory from '~/hooks/useCustomHistory'

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

  const publishedAt = timestampToCleanTime({ timestamp: page.publishedAt })
  const { navigateBack } = useCustomHistory()
  // Component implementation
  const handleBackButtonClick = () => {
    navigateBack()
  }

  return (
    <>
      {page && <PageSEO page={page} site={site} />}
      <Detail.Container data-cy="page-detail" ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonOnClick={handleBackButtonClick}
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
            </Detail.Header>

            {page.text && !page.data?.blocks?.length ? (
              <MarkdownRenderer children={page.text} className="prose mt-8" />
            ) : (
              <EditorJSEditor
                site={site}
                readOnly={true}
                value={page.data}
                editorRef={(el) => {
                  editorJsRef.current = el
                }}
              />
            )}

            {/* bottom padding to give space between page content and comments */}
            <div className="py-6" />
          </Detail.ContentContainer>

          {page._isMasked && <Paywall obj="Page" access={page.access} />}
        </div>

        <PoweredByNym scrollContainerRef={scrollContainerRef} />
      </Detail.Container>
    </>
  )
}
