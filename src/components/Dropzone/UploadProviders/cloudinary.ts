import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_PRESET } =
  publicRuntimeConfig

const Cloudinary = {
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

export default Cloudinary
