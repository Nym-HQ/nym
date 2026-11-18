import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CROSS_SITE_CODE_TTL_MS,
  CROSS_SITE_SESSION_MAX_AGE_MS,
  CrossSiteCodeRecord,
  CrossSiteLoginStore,
  hashCrossSiteCode,
  issueCrossSiteLoginCode,
  redeemCrossSiteLoginCode,
} from './crossSiteLoginCode'

function memoryStore() {
  const codes = new Map<string, CrossSiteCodeRecord>()
  const sessions: { sessionToken: string; userId: string; expires: Date }[] = []
  const store: CrossSiteLoginStore = {
    async saveCode(tokenHash, record) {
      codes.set(tokenHash, record)
    },
    async takeCode(tokenHash) {
      const record = codes.get(tokenHash) ?? null
      codes.delete(tokenHash)
      return record
    },
    async createSession(session) {
      sessions.push(session)
    },
  }
  return { store, codes, sessions }
}

const MAIN_SESSION_TOKEN = 'main-domain-session-token-abc123'
const USER_ID = 'user_cuid_123'
const NOW = 1_700_000_000_000
const IN_7_DAYS = new Date(NOW + 7 * 24 * 60 * 60 * 1000)

async function issue(
  store: CrossSiteLoginStore,
  overrides: Partial<{ destHost: string; sessionExpires: Date }> = {}
) {
  const code = await issueCrossSiteLoginCode(store, {
    userId: USER_ID,
    destHost: 'naamas.net',
    sessionExpires: IN_7_DAYS,
    now: NOW,
    ...overrides,
  })
  assert.ok(code)
  return code
}

describe('cross-site login codes', () => {
  it('issues an opaque random code that carries no session token or user id', async () => {
    const { store, codes } = memoryStore()
    const code = await issue(store)
    const other = await issue(store)

    assert.match(code, /^[A-Za-z0-9_-]{43}$/)
    assert.notEqual(code, other)
    const decoded = Buffer.from(code, 'base64url').toString('latin1')
    for (const text of [code, decoded]) {
      assert.equal(text.includes(MAIN_SESSION_TOKEN), false)
      assert.equal(text.includes(USER_ID), false)
      assert.equal(text.includes('naamas.net'), false)
    }
    // Only the hash is stored server-side, never the raw code.
    assert.equal(codes.has(code), false)
    assert.equal(codes.has(hashCrossSiteCode(code)), true)
    assert.equal(
      codes.get(hashCrossSiteCode(code))!.expires.getTime(),
      NOW + CROSS_SITE_CODE_TTL_MS
    )
  })

  it('redeems once on the right host into a NEW session for that host', async () => {
    const { store, sessions } = memoryStore()
    const code = await issue(store)

    const result = await redeemCrossSiteLoginCode(store, {
      code,
      host: 'NAAMAS.net',
      now: NOW + 1_000,
    })
    assert.ok(result)
    assert.notEqual(result.sessionToken, MAIN_SESSION_TOKEN)
    assert.equal(result.expires.getTime(), IN_7_DAYS.getTime())
    assert.equal(sessions.length, 1)
    assert.deepEqual(sessions[0], {
      sessionToken: result.sessionToken,
      userId: USER_ID,
      expires: IN_7_DAYS,
    })
  })

  it('is single use', async () => {
    const { store, sessions } = memoryStore()
    const code = await issue(store)
    const args = { code, host: 'naamas.net', now: NOW + 1_000 }

    assert.ok(await redeemCrossSiteLoginCode(store, args))
    assert.equal(await redeemCrossSiteLoginCode(store, args), null)
    assert.equal(sessions.length, 1)
  })

  it('expires after 60 seconds', async () => {
    const { store, sessions } = memoryStore()
    const code = await issue(store)

    assert.equal(
      await redeemCrossSiteLoginCode(store, {
        code,
        host: 'naamas.net',
        now: NOW + CROSS_SITE_CODE_TTL_MS + 1,
      }),
      null
    )
    assert.equal(sessions.length, 0)
  })

  it('rejects redemption on the wrong host and burns the code', async () => {
    const { store, sessions } = memoryStore()
    const code = await issue(store)

    assert.equal(
      await redeemCrossSiteLoginCode(store, {
        code,
        host: 'evil.example',
        now: NOW + 1_000,
      }),
      null
    )
    // A code tried on the wrong host cannot then be used on the right one.
    assert.equal(
      await redeemCrossSiteLoginCode(store, {
        code,
        host: 'naamas.net',
        now: NOW + 2_000,
      }),
      null
    )
    assert.equal(sessions.length, 0)
  })

  it('rejects malformed or unknown codes', async () => {
    const { store } = memoryStore()
    await issue(store)
    for (const code of [
      null,
      undefined,
      '',
      'abc',
      'x'.repeat(43),
      `${'a'.repeat(42)}.`,
    ]) {
      assert.equal(
        await redeemCrossSiteLoginCode(store, {
          code,
          host: 'naamas.net',
          now: NOW,
        }),
        null
      )
    }
  })

  it('never outlives the main-domain session, capped at 30 days', async () => {
    const { store } = memoryStore()
    const soon = new Date(NOW + 30_000)
    const code = await issue(store, { sessionExpires: soon })
    const result = await redeemCrossSiteLoginCode(store, {
      code,
      host: 'naamas.net',
      now: NOW + 1_000,
    })
    assert.equal(result!.expires.getTime(), soon.getTime())

    const far = new Date(NOW + 365 * 24 * 60 * 60 * 1000)
    const code2 = await issue(store, { sessionExpires: far })
    const result2 = await redeemCrossSiteLoginCode(store, {
      code: code2,
      host: 'naamas.net',
      now: NOW + 1_000,
    })
    assert.equal(
      result2!.expires.getTime(),
      NOW + CROSS_SITE_SESSION_MAX_AGE_MS
    )

    assert.equal(
      await issueCrossSiteLoginCode(store, {
        userId: USER_ID,
        destHost: 'naamas.net',
        sessionExpires: new Date(NOW - 1),
        now: NOW,
      }),
      null
    )
  })
})
