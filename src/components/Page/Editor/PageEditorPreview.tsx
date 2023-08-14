import * as React from 'react'

import { EditorJSPreviewer } from '~/components/EditorJS'
import { Detail } from '~/components/ListDetail/Detail'
import { MarkdownRenderer } from '~/components/MarkdownRenderer'

import { PageEditorContext } from './PageEditor'

export function PageEditorPreview() {
  const context = React.useContext(PageEditorContext)
  const { draftState } = context
  const { title, text, data } = draftState

  return (
    <Detail.ContentContainer>
      <Detail.Header
        style={{ maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Detail.Title>{title}</Detail.Title>
      </Detail.Header>

      {text && !data?.blocks ? (
        <MarkdownRenderer children={text} className="prose mt-8" />
      ) : (
        <div className="mt-3">
          <EditorJSPreviewer value={data} />
        </div>
      )}

      {/* <MarkdownRenderer children={text} className="prose mt-8" /> */}

      {/* bottom padding to give space between page content and comments */}
      <div className="py-6" />
    </Detail.ContentContainer>
  )
}
