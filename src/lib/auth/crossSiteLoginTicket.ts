const TICKET_TTL_MS = 60 * 1000

type TicketPayload = {
  v: 1
  st: string
  h: string
  exp: number
}

function getTicketSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.JWT_SIGNING_KEY || ''
}

function toBase64Url(bytes: Uint8Array | string) {
  const data =
    typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes
  let binary = ''
  data.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let i = 0; i < left.length; i++) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }
  return mismatch === 0
}

async function hmacSha256(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  )
  return toBase64Url(new Uint8Array(signature))
}

export function hasCrossSiteTicketSecret() {
  return Boolean(getTicketSecret())
}

export async function createCrossSiteLoginTicket(
  sessionToken: string,
  destHost: string,
  now = Date.now()
) {
  const secret = getTicketSecret()
  if (!secret || !sessionToken) return null

  const payload: TicketPayload = {
    v: 1,
    st: sessionToken,
    h: destHost.toLowerCase(),
    exp: now + TICKET_TTL_MS,
  }
  const encoded = toBase64Url(JSON.stringify(payload))
  const signature = await hmacSha256(secret, encoded)
  return `${encoded}.${signature}`
}

export async function consumeCrossSiteLoginTicket(
  ticket: string | null | undefined,
  destHost: string,
  now = Date.now()
) {
  if (!ticket) return null
  const secret = getTicketSecret()
  if (!secret) return null

  const [encoded, signature] = ticket.split('.')
  if (!encoded || !signature) return null

  const expected = await hmacSha256(secret, encoded)
  if (!timingSafeEqual(signature, expected)) return null

  try {
    const json = new TextDecoder().decode(fromBase64Url(encoded))
    const payload = JSON.parse(json) as TicketPayload
    if (payload.v !== 1 || !payload.st || !payload.h || !payload.exp) {
      return null
    }
    if (payload.exp < now) return null
    if (payload.h !== destHost.toLowerCase()) return null
    return payload.st
  } catch {
    return null
  }
}
