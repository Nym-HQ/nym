import * as React from 'react'

import { EditorJSPreviewer } from '~/components/EditorJS'
import { Detail } from '~/components/ListDetail/Detail'

import { NewsletterTemplateEditorContext } from './NewsletterTemplateEditor'

export function NewsletterTemplateEditorPreview() {
  const context = React.useContext(NewsletterTemplateEditorContext)
  const { draftState } = context
  const { subject, text, data } = draftState

  return (
    <Detail.ContentContainer>
      <Detail.Header
        style={{ maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Detail.Title>{subject}</Detail.Title>
      </Detail.Header>

      <div className="mt-3">
        <EditorJSPreviewer value={data} />
      </div>

      {/* bottom padding to give space between template content and comments */}
      <div className="py-6" />
    </Detail.ContentContainer>
  )
}
