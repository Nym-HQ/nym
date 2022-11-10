import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { MarkdownRenderer } from '~/components/MarkdownRenderer'

import { PageEditorContext } from './PageEditor'

export function PageEditorPreview() {
  const context = React.useContext(PageEditorContext)
  const { draftState } = context
  const { title, text } = draftState

  return (
    <Detail.ContentContainer>
      <Detail.Header>
        <Detail.Title>{title}</Detail.Title>
      </Detail.Header>

      <MarkdownRenderer children={text} className="prose mt-8" />

      {/* bottom padding to give space between page content and comments */}
      <div className="py-6" />
    </Detail.ContentContainer>
  )
}
