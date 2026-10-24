const SAFE_PUBLIC_ID = /^[A-Za-z0-9_-]{1,64}$/
const SAFE_TRANSFORMATION = /^[A-Za-z0-9_,.:\/-]{1,128}$/

function asFlag(value: unknown, fallback: string) {
  if (value === true || value === 'true') return 'true'
  if (value === false || value === 'false') return 'false'
  return fallback
}

export function buildCloudinarySignParams({
  body,
  siteId,
  uploadPreset,
}: {
  body: Record<string, unknown>
  siteId?: string | null
  uploadPreset?: string | null
}) {
  if (!uploadPreset) return null

  const timestamp = String(body.timestamp ?? Math.floor(Date.now() / 1000))
  if (!/^\d{1,16}$/.test(timestamp)) return null

  const allowedFolders = new Set([siteId, 'nymhq'].filter(Boolean) as string[])
  const folder =
    typeof body.folder === 'string' && body.folder
      ? body.folder
      : siteId || 'nymhq'
  if (!allowedFolders.has(folder)) return null

  const preset =
    typeof body.upload_preset === 'string' && body.upload_preset
      ? body.upload_preset
      : uploadPreset
  if (preset !== uploadPreset) return null

  const params: Record<string, string> = {
    timestamp,
    folder,
    upload_preset: preset,
    discard_original_filename: asFlag(body.discard_original_filename, 'true'),
    overwrite: asFlag(body.overwrite, 'true'),
  }

  if (body.use_filename != null) {
    params.use_filename = asFlag(body.use_filename, 'false')
  }

  if (typeof body.public_id === 'string' && body.public_id) {
    if (!SAFE_PUBLIC_ID.test(body.public_id)) return null
    params.public_id = body.public_id
  }

  if (typeof body.transformation === 'string' && body.transformation) {
    if (!SAFE_TRANSFORMATION.test(body.transformation)) return null
    params.transformation = body.transformation
  }

  return params
}
