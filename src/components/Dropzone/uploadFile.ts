import Cloudflare from './UploadProviders/cloudflare'
import Cloudinary from './UploadProviders/cloudinary'

function uploadFile({
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

export { Cloudflare, Cloudinary, uploadFile }
