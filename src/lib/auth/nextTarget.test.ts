import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isTrustedPlatformHost,
  parkedDomainLookupCandidates,
  parseNextParam,
  safeRelativePathFromAbsolute,
} from './nextTarget'

describe('parseNextParam', () => {
  it('allows relative paths', () => {
    assert.deepEqual(parseNextParam(null), { kind: 'relative', path: '/' })
    assert.deepEqual(parseNextParam('/admin'), {
      kind: 'relative',
      path: '/admin',
    })
  })

  it('rejects protocol-relative, backslash, and non-http schemes', () => {
    assert.equal(parseNextParam('//evil.example').kind, 'invalid')
    assert.equal(parseNextParam('/\\evil.example').kind, 'invalid')
    assert.equal(parseNextParam('javascript:alert(1)').kind, 'invalid')
    assert.equal(parseNextParam('data:text/html,hi').kind, 'invalid')
  })

  it('parses absolute http(s) URLs', () => {
    const parsed = parseNextParam('https://naamas.net/writing')
    assert.equal(parsed.kind, 'absolute')
    if (parsed.kind === 'absolute') {
      assert.equal(parsed.url.host, 'naamas.net')
      assert.equal(parsed.url.pathname, '/writing')
    }
  })
})

describe('isTrustedPlatformHost', () => {
  it('trusts the main app host and tenant subdomains', () => {
    assert.equal(isTrustedPlatformHost('app.nymhq.local:3000'), true)
    assert.equal(isTrustedPlatformHost('alice.nymhq.local:3000'), true)
  })

  it('does not trust arbitrary hosts or reserved subdomains', () => {
    assert.equal(isTrustedPlatformHost('evil.example'), false)
    assert.equal(isTrustedPlatformHost('www.nymhq.local:3000'), false)
  })
})

describe('parkedDomainLookupCandidates', () => {
  it('includes the host with and without a port', () => {
    assert.deepEqual(parkedDomainLookupCandidates('Naamas.net:443'), [
      'naamas.net:443',
      'naamas.net',
    ])
  })
})

describe('safeRelativePathFromAbsolute', () => {
  it('keeps same-host paths and drops cross-host next values', () => {
    assert.equal(
      safeRelativePathFromAbsolute(
        new URL('https://naamas.net/writing?x=1'),
        'naamas.net'
      ),
      '/writing?x=1'
    )
    assert.equal(
      safeRelativePathFromAbsolute(
        new URL('https://evil.example/'),
        'naamas.net'
      ),
      '/'
    )
  })
})
