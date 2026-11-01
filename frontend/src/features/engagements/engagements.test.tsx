import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { mockApi, renderApp } from '@/test/render'

import type { Engagement } from './types'

const acme: Engagement = {
  id: '6f1c5b0e-0000-4000-8000-000000000001',
  client_name: 'Acme Uganda Ltd',
  period_start: '2025-07-01',
  period_end: '2026-06-30',
  framework: 'ifrs',
  status: 'planning',
  created_at: '2026-10-31T00:00:00Z',
  updated_at: '2026-10-31T00:00:00Z',
}

const page = (items: Engagement[]) => ({ items, total: items.length, limit: 50, offset: 0 })
const health = { status: 'ok', database: true, worker: { ok: true, seen_at: null }, version: '0.1.0' }

describe('engagements', () => {
  it('lists engagements with their phase', async () => {
    mockApi((url) => (url.pathname === '/api/health' ? health : page([acme])))
    renderApp('/')
    expect(await screen.findByRole('link', { name: 'Acme Uganda Ltd' })).toBeInTheDocument()
    expect(screen.getByText('30 Jun 2026')).toBeInTheDocument()
    expect(screen.getAllByText('Planning').length).toBeGreaterThan(0)
  })

  it('filters by phase through the API', async () => {
    const fetchMock = mockApi((url) => (url.pathname === '/api/health' ? health : page([])))
    renderApp('/')
    await userEvent.click(await screen.findByRole('button', { name: /^Signed/ }))
    expect(await screen.findByText('No engagements in signed.')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([u]) => String(u) === '/api/engagements?status=signed')).toBe(true)
  })

  it('moves an engagement to the next phase', async () => {
    let current = acme
    mockApi((url, init) => {
      if (url.pathname === '/api/health') return health
      if (init?.method === 'PATCH') current = { ...current, ...(JSON.parse(String(init.body)) as Partial<Engagement>) }
      return current
    })
    renderApp(`/engagements/${acme.id}`)
    await userEvent.click(await screen.findByRole('button', { name: 'Move to fieldwork' }))
    expect(await screen.findByRole('button', { name: 'Move to completion' })).toBeInTheDocument()
  })

  it('says when an engagement does not exist', async () => {
    mockApi((url) =>
      url.pathname === '/api/health' ? health : Response.json({ detail: 'engagement not found' }, { status: 404 }),
    )
    renderApp('/engagements/missing')
    expect(await screen.findByText('This engagement does not exist.')).toBeInTheDocument()
  })
})
