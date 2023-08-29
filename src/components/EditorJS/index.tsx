'use client'

import dynamic from 'next/dynamic'

const CustomizedEditorJS = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

export function EditorJSEditor({
  value,
  site,
  readOnly = false,
  editorRef = (el) => {},
  onChange = (data) => {},
}) {
  return (
    <CustomizedEditorJS
      id="editor-js-container"
      value={value}
      site={site}
      readOnly={readOnly}
      editorRef={editorRef}
      onChange={onChange}
    />
  )
}
