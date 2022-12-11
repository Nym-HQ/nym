import { UploadApiOptions } from 'cloudinary/types'
const cloudinary = require('cloudinary').v2

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const defaultOptions = {
  overwrite: true,
  unique_filename: true,
} as UploadApiOptions

// Upload
export function uploadImage(imageUploaded, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageUploaded,
      {
        ...defaultOptions,
        ...options,
      },
      (err, res) => {
        if (err) return reject(err)

        resolve(res)
      }
    )
  })
}

export default cloudinary
