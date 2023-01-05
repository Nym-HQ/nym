import * as React from 'react'

import { EditorJSEditor } from '~/components/EditorJS'
import { Textarea } from '~/components/Input'
import { Detail } from '~/components/ListDetail/Detail'
import { CustomizedMDEditor } from '~/components/ReactMdEditor'

import { PageEditorContext } from './PageEditor'

export function PageEditorComposer({ site }) {
  const context = React.useContext(PageEditorContext)
  const { draftState, setDraftState } = context

  function handleTitleChange(e) {
    let v = (e.target.value || '').replaceAll(/\n/g, ' ') // Do not allow line changes in the title
    setDraftState((draft) => ({ ...draft, title: v }))
  }

  function handleTextChange(e) {
    setDraftState((draft) => ({ ...draft, text: e }))
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
          value={draftState.title}
          onChange={handleTitleChange}
          placeholder={'Page title'}
          className="block w-full p-0 text-2xl font-bold border-none composer text-primary focus:border-0 focus:outline-none focus:ring-0 dark:bg-black md:text-3xl"
        />
      </Detail.Header>

      {draftState.text && !draftState.data?.blocks ? (
        <CustomizedMDEditor
          value={draftState.text}
          onChange={handleTextChange}
        />
      ) : (
        <div className="mt-3">
          <EditorJSEditor
            value={draftState.data}
            site={site}
            editorRef={(el) => {}}
            onChange={handleDataChange}
          />
        </div>
      )}

      {/* <Textarea
          rows={20}
          maxRows={2000}
          value={draftState.text}
          onChange={handleTextChange}
          placeholder={'Write a page...'}
          className="block w-full p-0 pt-5 text-lg font-normal prose border-none composer text-primary focus:border-0 focus:outline-none focus:ring-0 dark:bg-black"
        /> */}
    </Detail.ContentContainer>
  )
}
