import dynamic from 'next/dynamic'
import * as React from 'react'

import { Cloudflare, Cloudinary, uploadFile } from '../Dropzone/uploadUtils'

export const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

export const MDEditorPreviewer = dynamic(
  () =>
    import('@uiw/react-md-editor').then((mod) => {
      return mod.default.Markdown
    }),
  { ssr: false }
)

export function CustomizedMDEditor({ value, onChange, ...props }) {
  const [commands, setCommands] = React.useState(null)

  import('@uiw/react-md-editor').then((mod) => {
    setCommands(mod.commands)
  })

  const fileRef = React.useRef(null)
  const fileProvider =
    (props.fileProvider || 'cloudinary') == 'cloudinary'
      ? Cloudinary
      : Cloudflare

  const imageUploadCommand = {
    name: 'imageUpload',
    keyCommand: 'imageUpload',
    shortcuts: 'ctrlcmd+k',
    value: '![image]()',
    buttonProps: {
      'aria-label': 'Add image (ctrl + k)',
      title: 'Add image (ctrl + k)',
    },
    icon: (
      <svg width="13" height="13" viewBox="0 0 20 20">
        <path
          fill="currentColor"
          d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"
        />
      </svg>
    ),
    execute: async (state, api) => {
      fileRef.current.onchange = async (e) => {
        const file = e.target.files[0]
        try {
          const progressText = 'Uploading image...'
          let state1 = api.replaceSelection(progressText)
          state1 = api.setSelectionRange({
            start: state1.selection.start - progressText.length,
            end: state1.selection.end,
          })
          const url = await uploadFile({
            file,
            fileProvider,
            site: props.site,
            upload_options: props.upload_options,
          })
          state1 = api.replaceSelection(url)
          commands.image.execute(state1, api)
        } catch (e) {}
      }
      fileRef.current.click()
    },
  }

  const getCommands = () => {
    if (commands) {
      console.log('heyhey')
      return [
        commands.bold,
        commands.italic,
        commands.strikethrough,
        commands.hr,
        commands.group(
          [
            commands.title1,
            commands.title2,
            commands.title3,
            commands.title4,
            commands.title5,
            commands.title6,
          ],
          {
            name: 'title',
            groupName: 'title',
            buttonProps: {
              'aria-label': 'Insert title',
              title: 'Insert title',
            },
          }
        ),
        commands.divider,
        commands.link,
        commands.quote,
        commands.code,
        commands.codeBlock,
        imageUploadCommand,
        commands.divider,
        commands.unorderedListCommand,
        commands.orderedListCommand,
        commands.checkedListCommand,
      ]
    } else {
      ;[]
    }
  }

  return (
    <div className="block w-full relative p-0 text-lg font-normal">
      <input type="file" ref={fileRef} style={{ display: 'none' }} />
      <MDEditor
        value={value}
        onChange={onChange}
        preview="edit"
        height={500}
        commands={getCommands()}
        {...props}
      />
    </div>
  )
}
