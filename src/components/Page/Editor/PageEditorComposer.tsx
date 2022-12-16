import * as React from 'react'

import { Dropzone } from '~/components/Dropzone'
import { Textarea } from '~/components/Input'
import { Detail } from '~/components/ListDetail/Detail'
import { MDEditor } from '~/components/ReactMdEditor'

import { PageEditorContext } from './PageEditor'

export function PageEditorComposer({ site }) {
  const context = React.useContext(PageEditorContext)
  const { draftState, setDraftState } = context
  const uploadingImagePlaceholder = '![](Uploading...)'

  function handleTitleChange(e) {
    setDraftState((draft) => ({ ...draft, title: e.target.value }))
  }

  function handleTextChange(e) {
    setDraftState((draft) => ({ ...draft, text: e }))
  }

  function onUploadComplete(url) {
    const image = `![](${url})`
    setDraftState((draft) => ({
      ...draft,
      text: draft.text.replace(uploadingImagePlaceholder, image),
    }))
  }

  function onUploadFailed() {
    setDraftState((draft) => ({
      ...draft,
      text: draft.text.replace(uploadingImagePlaceholder, ''),
    }))
  }

  function onUploadStarted() {
    setDraftState((draft) => ({
      ...draft,
      text: (draft.text += uploadingImagePlaceholder),
    }))
  }

  return (
    <Dropzone
      site={site}
      onUploadStarted={onUploadStarted}
      onUploadComplete={onUploadComplete}
      onUploadFailed={onUploadFailed}
    >
      <Detail.ContentContainer>
        <Detail.Header>
          <Textarea
            rows={1}
            value={draftState.title}
            onChange={handleTitleChange}
            placeholder={'Page title'}
            className="block w-full p-0 text-2xl font-bold border-none composer text-primary focus:border-0 focus:outline-none focus:ring-0 dark:bg-black md:text-3xl"
          />
          <div className="block w-full relative p-0 text-lg font-normal">
            <MDEditor
              value={draftState.text}
              onChange={handleTextChange}
              preview="edit"
              height={500}
            />
          </div>
          {/* <Textarea
            rows={20}
            maxRows={2000}
            value={draftState.text}
            onChange={handleTextChange}
            placeholder={'Write a page...'}
            className="block w-full p-0 pt-5 text-lg font-normal prose border-none composer text-primary focus:border-0 focus:outline-none focus:ring-0 dark:bg-black"
          /> */}
        </Detail.Header>
      </Detail.ContentContainer>
    </Dropzone>
  )
}
