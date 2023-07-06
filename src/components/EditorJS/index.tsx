'use client'

import dynamic from 'next/dynamic'

const CustomizedEditorJS = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

export function EditorJSPreviewer({ value, editorRef = (el) => {} }) {
  return (
    <CustomizedEditorJS
      id="editor-js-preview-container"
      value={value}
      readOnly={true}
      site={null}
      editorRef={editorRef}
    />
  )
}

export function EditorJSEditor({
  value,
  site,
  editorRef = (el) => {},
  onChange = (data) => {},
}) {
  return (
    <CustomizedEditorJS
      id="editor-js-container"
      value={value}
      site={site}
      editorRef={editorRef}
      onChange={onChange}
    />
  )
}
