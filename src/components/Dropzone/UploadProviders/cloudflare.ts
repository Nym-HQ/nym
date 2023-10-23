import { CLOUDFLARE_IMAGE_DELIVERY_BASE_URL } from '~/lib/cloudflare'

const Cloudflare = {
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

export default Cloudflare
