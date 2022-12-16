import getConfig from 'next/config'

import { CLOUDFLARE_IMAGE_DELIVERY_BASE_URL } from '~/lib/cloudflare'

const { publicRuntimeConfig } = getConfig()
const { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_PRESET } =
  publicRuntimeConfig

export const Cloudinary = {
  getParams: (site, extra_params) => {
    const timestamp = Date.now()
    const params = {
      discard_original_filename: 'true',
      folder: site?.id || 'nymhq',
      overwrite: 'true',
      timestamp: timestamp,
      upload_preset: CLOUDINARY_PRESET,
      ...extra_params,
    } as any
    return params
  },
  sign: async (params) => {
    return await fetch('/api/images/cloudinary/sign', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())
  },
  uploadFile: async ({ site, file, params, signData }) => {
    const formData = new FormData()
    const url =
      'https://api.cloudinary.com/v1_1/' +
      CLOUDINARY_CLOUD_NAME +
      '/auto/upload'

    formData.append('file', file)
    formData.append('api_key', CLOUDINARY_API_KEY)
    formData.append('signature', signData.signature)

    Object.keys(params).forEach(function (key) {
      formData.append(key, params[key])
    })

    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    }).then((r) => r.json())
    return upload
  },
  getPublicUrl: (upload) => {
    return (upload.eager && upload.eager[0]?.url) || upload?.url
  },
}

export const Cloudflare = {
  getParams: () => {
    return {}
  },
  sign: async (req) => {
    return await fetch('/api/images/cloudflare/sign').then((res) => res.json())
  },
  uploadFile: async ({ site, params, file, signData }) => {
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

export function uploadFile({
  file,
  fileProvider,
  site,
  upload_options,
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const params = fileProvider.getParams(site, upload_options)
    const timestamp = Date.now()
    const signData = await fileProvider.sign(params)

    if (!signData) {
      console.error('No signed url')
      reject()
    }

    const upload = await fileProvider.uploadFile({
      site: site,
      params,
      file,
      signData,
    })
    if (!upload) {
      console.error('Upload failed')
      reject()
    }

    const url = fileProvider.getPublicUrl(upload)
    resolve(url)
  })
}
