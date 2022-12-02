import dynamic from 'next/dynamic'
import * as React from 'react'

import { Detail } from '~/components/ListDetail/Detail'
import { MarkdownRenderer } from '~/components/MarkdownRenderer'
import { MDEditorPreviewer } from '~/components/ReactMdEditor'

import { PostEditorContext } from './PostEditor'

export function PostEditorPreview() {
  const context = React.useContext(PostEditorContext)
  const { draftState } = context
  const { title, text } = draftState

  return (
    <Detail.ContentContainer>
      <Detail.Header>
        <Detail.Title>{title}</Detail.Title>
      </Detail.Header>

      <div className="mt-8">
        <MDEditorPreviewer source={text} />
      </div>
      {/* <MarkdownRenderer children={text} className="prose mt-8" /> */}

      {/* bottom padding to give space between post content and comments */}
      <div className="py-6" />
    </Detail.ContentContainer>
  )
}
