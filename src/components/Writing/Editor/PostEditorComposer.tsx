import * as React from 'react'

import { EditorJSEditor } from '~/components/EditorJS'
import { Textarea } from '~/components/Input'
import { Detail } from '~/components/ListDetail/Detail'
import { CustomizedMDEditor } from '~/components/ReactMdEditor'
import { slugifyString } from '~/lib/utils'

import { PostEditorContext } from './PostEditor'

export function PostEditorComposer({ site }) {
  const context = React.useContext(PostEditorContext)
  const { draftState, setDraftState, existingPost, isPreviewing } = context
  const editorJsRef = React.useRef(null)

  const handleTitleChange = React.useCallback(
    (e) => {
      let title = (e.target.value || '').replaceAll(/\n/g, ' ') // Do not allow line changes in the title
      var slug = draftState.slug
      if (!existingPost) {
        // if we are creating a new post, automatically generate slug based on the title
        slug = slugifyString(title)
      }

      setDraftState((draft) => ({ ...draft, title, slug }))

      // on press enter, focus the editor
      if ((e.target.value || '') !== title) {
        editorJsRef.current &&
          editorJsRef.current._editorJS &&
          editorJsRef.current._editorJS.focus()
      }
    },
    [setDraftState, editorJsRef]
  )

  const handleTextChange = React.useCallback(
    (e) => setDraftState((draft) => ({ ...draft, text: e })),
    [setDraftState]
  )

  const handleDataChange = React.useCallback(
    (data) => {
      console.log('editorjs data change', data)
      setDraftState((draft) => ({ ...draft, data }))
    },
    [setDraftState]
  )

  return (
    <Detail.ContentContainer>
      <Detail.Header
        style={{ maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Textarea
          rows={1}
          value={draftState.title}
          onChange={handleTitleChange}
          placeholder={'Post title'}
          disabled={isPreviewing}
          className="block w-full p-0 text-2xl font-bold border-none composer text-primary focus:border-0 focus:outline-none focus:ring-0 dark:bg-black md:text-3xl"
        />
      </Detail.Header>

      {draftState.text && !draftState.data?.blocks?.length ? (
        <CustomizedMDEditor
          value={draftState.text}
          onChange={handleTextChange}
        />
      ) : (
        <div className="mt-3">
          <EditorJSEditor
            readOnly={isPreviewing}
            value={draftState.data}
            site={site}
            editorRef={(el) => {
              editorJsRef.current = el
            }}
            onChange={handleDataChange}
          />
        </div>
      )}
    </Detail.ContentContainer>
  )
}
