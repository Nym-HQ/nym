import React from 'react'
import { useDropzone } from 'react-dropzone'

import { Site } from '~/graphql/types.generated'

import { ActiveDropzone } from './ActiveDropzone'
import { Cloudflare, Cloudinary, uploadFile } from './uploadUtils'

interface DropzoneProps {
  site?: Site
  upload_options?: any
  fileProvider?: 'cloudinary' | 'cloudflare'
  children: React.ReactNode
  onUploadStarted: () => void
  onUploadComplete: (url?: string) => void
  onUploadFailed: () => void
}

export function Dropzone(props: DropzoneProps) {
  const { children, onUploadComplete, onUploadStarted, onUploadFailed } = props

  const fileProvider =
    (props.fileProvider || 'cloudinary') == 'cloudinary'
      ? Cloudinary
      : Cloudflare

  const onDropAccepted = React.useCallback(async (acceptedFiles: File[]) => {
    onUploadStarted()

    const file = acceptedFiles[0]
    try {
      const url = await uploadFile({
        file,
        fileProvider,
        site: props.site,
        upload_options: props.upload_options,
      })
      return onUploadComplete(url)
    } catch (e) {
      onUploadFailed()
    }
  }, [])

  function onDropRejected() {
    alert('File rejected')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    noKeyboard: true,
    multiple: false,
    noClick: true,
    maxSize: 1000 * 1000 * 3, // 3mb
    accept: ['image/jpeg', 'image/png', 'image/gif'],
  })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? <ActiveDropzone /> : children}
    </div>
  )
}
