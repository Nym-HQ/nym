import dynamic from 'next/dynamic'

const CustomizedEditorJS = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

export function EditorJSPreviewer({ value, editorRef = (el) => {}, ...props }) {
  return (
    <CustomizedEditorJS
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
