import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildCloudinarySignParams } from './cloudinarySignParams'

describe('buildCloudinarySignParams', () => {
  it('signs only the allowlisted params for the current site', () => {
    const params = buildCloudinarySignParams({
      body: {
        timestamp: '1710000000',
        folder: 'site-a',
        upload_preset: 'nym-preset',
        discard_original_filename: 'true',
        overwrite: 'true',
        public_id: 'site_logo',
        transformation: 'h_600,w_600,c_fit',
        eager: 'should-not-be-signed',
      },
      siteId: 'site-a',
      uploadPreset: 'nym-preset',
    })

    assert.deepEqual(params, {
      timestamp: '1710000000',
      folder: 'site-a',
      upload_preset: 'nym-preset',
      discard_original_filename: 'true',
      overwrite: 'true',
      public_id: 'site_logo',
      transformation: 'h_600,w_600,c_fit',
    })
  })

  it('rejects a caller-chosen folder, preset, or unsafe public_id', () => {
    assert.equal(
      buildCloudinarySignParams({
        body: {
          timestamp: '1',
          folder: 'other-site',
          upload_preset: 'nym-preset',
        },
        siteId: 'site-a',
        uploadPreset: 'nym-preset',
      }),
      null
    )
    assert.equal(
      buildCloudinarySignParams({
        body: { timestamp: '1', folder: 'site-a', upload_preset: 'attacker' },
        siteId: 'site-a',
        uploadPreset: 'nym-preset',
      }),
      null
    )
    assert.equal(
      buildCloudinarySignParams({
        body: {
          timestamp: '1',
          folder: 'site-a',
          upload_preset: 'nym-preset',
          public_id: '../etc/passwd',
        },
        siteId: 'site-a',
        uploadPreset: 'nym-preset',
      }),
      null
    )
  })
})
