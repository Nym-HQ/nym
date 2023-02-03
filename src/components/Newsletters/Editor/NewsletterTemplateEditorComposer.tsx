import * as React from 'react'

import { EditorJSEditor } from '~/components/EditorJS'
import { Textarea } from '~/components/Input'
import { Detail } from '~/components/ListDetail/Detail'

import { NewsletterTemplateEditorContext } from './NewsletterTemplateEditor'

export function NewsletterTemplateEditorComposer({ site }) {
  const context = React.useContext(NewsletterTemplateEditorContext)
  const { draftState, setDraftState } = context
  const editorJsRef = React.useRef(null)

  function handleSubjectChange(e) {
    let v = (e.target.value || '').replaceAll(/\n/g, ' ') // Do not allow line changes in the title
    setDraftState((draft) => ({ ...draft, title: v }))

    // on press enter, focus the editor
    if ((e.target.value || '') !== v) {
      // line changes?
      editorJsRef.current &&
        editorJsRef.current._editorJS &&
        editorJsRef.current._editorJS.focus()
    }
  }

  function handleDataChange(data) {
    setDraftState((draft) => ({ ...draft, data }))
  }

  return (
    <Detail.ContentContainer>
      <Detail.Header
        style={{ maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Textarea
          rows={1}
          value={draftState.subject}
          onChange={handleSubjectChange}
          placeholder={'Newsletter Subject'}
          className="block w-full p-0 text-2xl font-bold border-none composer text-primary focus:border-0 focus:outline-none focus:ring-0 dark:bg-black md:text-3xl"
        />
      </Detail.Header>

      <div className="mt-3">
        <EditorJSEditor
          value={draftState.data}
          site={site}
          editorRef={(el) => {
            editorJsRef.current = el
          }}
          onChange={handleDataChange}
        />
      </div>
    </Detail.ContentContainer>
  )
}
