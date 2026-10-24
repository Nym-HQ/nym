import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import {
  consumeCrossSiteLoginTicket,
  createCrossSiteLoginTicket,
} from './crossSiteLoginTicket'

const ORIGINAL_SECRET = process.env.NEXTAUTH_SECRET

describe('cross-site login tickets', () => {
  afterEach(() => {
    if (ORIGINAL_SECRET == null) delete process.env.NEXTAUTH_SECRET
    else process.env.NEXTAUTH_SECRET = ORIGINAL_SECRET
  })

  it('round-trips a host-bound ticket', async () => {
    process.env.NEXTAUTH_SECRET = 'test-secret-value'
    const ticket = await createCrossSiteLoginTicket(
      'session-abc',
      'naamas.net',
      1_000
    )
    assert.ok(ticket)
    assert.equal(ticket.includes('session-abc'), false)

    const session = await consumeCrossSiteLoginTicket(
      ticket,
      'naamas.net',
      1_500
    )
    assert.equal(session, 'session-abc')
  })

  it('rejects expired, wrong-host, and tampered tickets', async () => {
    process.env.NEXTAUTH_SECRET = 'test-secret-value'
    const ticket = await createCrossSiteLoginTicket(
      'session-abc',
      'naamas.net',
      1_000
    )

    assert.equal(
      await consumeCrossSiteLoginTicket(ticket, 'naamas.net', 70_000),
      null
    )
    assert.equal(
      await consumeCrossSiteLoginTicket(ticket, 'evil.example', 1_500),
      null
    )
    assert.equal(
      await consumeCrossSiteLoginTicket(`${ticket}x`, 'naamas.net', 1_500),
      null
    )
  })
})
