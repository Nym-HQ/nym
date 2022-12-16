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
  const fileRef = React.useRef(null)
  const fileProvider =
    (props.fileProvider || 'cloudinary') == 'cloudinary'
      ? Cloudinary
      : Cloudflare

  /**
   * Creates a image upload command by extending existing imageCommand
   * @param imageCommand
   * @returns
   */
  const getImageUploadCommand = (imageCommand) => {
    return {
      ...imageCommand,
      name: 'imageUpload',
      keyCommand: 'imageUpload',
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
            imageCommand.execute(state1, api)
          } catch (e) {}
        }
        fileRef.current.click()
      },
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
        components={{
          toolbar: (command, disabled, executeCommand) => {
            if (command.keyCommand === 'image') {
              return (
                <button
                  {...command.buttonProps}
                  disabled={disabled}
                  onClick={(evn) => {
                    evn.stopPropagation()
                    const imageUploadCommand = getImageUploadCommand(command)
                    executeCommand(imageUploadCommand)
                  }}
                >
                  {command.icon}
                </button>
              )
            }
          },
        }}
        {...props}
      />
    </div>
  )
}
