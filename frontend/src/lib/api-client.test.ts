import { describe, expect, it } from 'vitest'

import { mockApi } from '@/test/render'

import { api, ApiError, qs } from './api-client'

describe('api client', () => {
  it('calls /api on the same origin', async () => {
    const fetchMock = mockApi(() => ({ ok: true }))
    await expect(api.get('/health')).resolves.toEqual({ ok: true })
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/health')
  })

  it('turns an error response into an ApiError with its detail', async () => {
    mockApi(() => Response.json({ detail: 'engagement not found' }, { status: 404 }))
    const err = await api.get('/engagements/x').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 404, message: 'engagement not found' })
  })

  it('drops empty query values', () => {
    expect(qs({ status: undefined, limit: 10, q: '' })).toBe('?limit=10')
    expect(qs({})).toBe('')
  })
})
