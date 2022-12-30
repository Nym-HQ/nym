import dynamic from 'next/dynamic'

const CustomizedEditorJS = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <p>loading editor.js ...</p>,
})

export function EditorJSPreviewer({ value, ...props }) {
  return <CustomizedEditorJS value={value} readOnly={true} site={null} />
}

export function EditorJSEditor({
  value,
  site,
  editorRef = (el) => {},
  onChange = (data) => {},
  ...props
}) {
  return (
    <CustomizedEditorJS
      value={value}
      site={site}
      editorRef={editorRef}
      onChange={onChange}
    />
  )
}
