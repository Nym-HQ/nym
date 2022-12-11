import getConfig from 'next/config'
import React from 'react'
import { useDropzone } from 'react-dropzone'

import { Site } from '~/graphql/types.generated'
import { CLOUDFLARE_IMAGE_DELIVERY_BASE_URL } from '~/lib/cloudflare'

import { ActiveDropzone } from './ActiveDropzone'

const { publicRuntimeConfig } = getConfig()
const { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_PRESET } = publicRuntimeConfig

interface DropzoneProps {
  site?: Site,
  exact_filename?: string,
  fileProvider?: 'cloudinary' | 'cloudflare'
  children: React.ReactNode
  onUploadStarted: () => void
  onUploadComplete: (url?: string) => void
  onUploadFailed: () => void
}

const Cloudinary = {
  sign: async ({ site, timestamp, exact_filename }) => {
    const params = {
      'discard_original_filename': 'true',
      'folder': site?.id || 'nymhq',
      'overwrite': 'true',
      'timestamp': timestamp,
      'upload_preset': CLOUDINARY_PRESET,
      'use_filename': exact_filename ? 'false' : 'true',
    } as any;
    
    if (exact_filename)
      params.public_id = exact_filename

    return await fetch('/api/images/cloudinary/sign', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }).then((res) => res.json())
  },
  uploadFile: async ({ site, timestamp, exact_filename, file, signData }) => {
    const formData = new FormData()
    const url = 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/auto/upload'

    formData.append('file', file)
    formData.append('api_key', CLOUDINARY_API_KEY)
    formData.append('signature', signData.signature)

    formData.append('discard_original_filename', 'true')
    formData.append('folder', site?.id || 'nymhq')
    formData.append('overwrite', 'true')
    if (exact_filename)
      formData.append('public_id', exact_filename)
    formData.append('timestamp', timestamp)
    formData.append('upload_preset', CLOUDINARY_PRESET)
    formData.append('use_filename', exact_filename ? 'false' : 'true')

    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    }).then(r => r.json())
    return upload
  },
  getPublicUrl: (upload) => {
    return upload?.url
  },
}

const Cloudflare = {
  sign: async (req) => {
    return await fetch('/api/images/cloudflare/sign').then((res) => res.json())
  },
  uploadFile: async ({ site, exact_filename, file, signData }) => {
    const { uploadUrl } = signData
    const data = new FormData()
    data.append('file', file)
    const upload = await fetch(uploadUrl, {
      method: 'POST',
      body: data,
    }).then((r) => r.json())
    return upload
  },
  getPublicUrl: (upload) => {
    return `${CLOUDFLARE_IMAGE_DELIVERY_BASE_URL}/${upload?.result?.id}/public`
  },
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
    const timestamp = Date.now()
    const signData = await fileProvider.sign({
      site: props.site,
      timestamp: timestamp,
      exact_filename: props.exact_filename
    })

    if (!signData) {
      onUploadFailed()
      return console.error('No signed url')
    }

    const upload = await fileProvider.uploadFile({
      site: props.site,
      timestamp: timestamp,
      exact_filename: props.exact_filename,
      file,
      signData,
    })
    if (!upload) {
      onUploadFailed()
      return console.error('Upload failed')
    }

    const url = fileProvider.getPublicUrl(upload)
    return onUploadComplete(url)
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
