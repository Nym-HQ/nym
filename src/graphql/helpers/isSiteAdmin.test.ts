import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SiteRole } from '@prisma/client'

import { UserRole } from '../types.generated'
import {
  canViewerDeleteSite,
  canViewSiteSecrets,
  isSiteAdmin,
} from './isSiteAdmin'

describe('isSiteAdmin', () => {
  it('is true for a platform or host admin', () => {
    assert.equal(isSiteAdmin({ viewer: { isAdmin: true } as any }), true)
    assert.equal(
      isSiteAdmin({ userSite: { siteRole: SiteRole.OWNER } as any }),
      true
    )
    assert.equal(
      isSiteAdmin({ userSite: { siteRole: SiteRole.ADMIN } as any }),
      true
    )
  })

  it('is false for anonymous or regular members', () => {
    assert.equal(isSiteAdmin({}), false)
    assert.equal(
      isSiteAdmin({
        viewer: { isAdmin: false } as any,
        userSite: { siteRole: SiteRole.USER } as any,
      }),
      false
    )
  })
})

describe('canViewSiteSecrets', () => {
  const site = { id: 'site-a' }

  it('hides secrets from anonymous callers and other sites', () => {
    assert.equal(canViewSiteSecrets({}, 'site-a'), false)
    assert.equal(
      canViewSiteSecrets(
        {
          viewer: { isAdmin: true, role: UserRole.User } as any,
          site: { id: 'site-b' } as any,
        },
        'site-a'
      ),
      false
    )
  })

  it('returns secrets to a host site admin and platform admin', () => {
    assert.equal(
      canViewSiteSecrets(
        {
          viewer: { isAdmin: true, role: UserRole.User } as any,
          site: site as any,
        },
        'site-a'
      ),
      true
    )
    assert.equal(
      canViewSiteSecrets(
        {
          viewer: { isAdmin: false, role: UserRole.Admin } as any,
          site: { id: 'other' } as any,
        },
        'site-a'
      ),
      true
    )
  })
})

describe('canViewerDeleteSite', () => {
  it('is only true for the site owner', () => {
    assert.equal(canViewerDeleteSite(SiteRole.OWNER), true)
    assert.equal(canViewerDeleteSite(SiteRole.ADMIN), false)
    assert.equal(canViewerDeleteSite(SiteRole.USER), false)
    assert.equal(canViewerDeleteSite(null), false)
  })
})
