import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Engagement } from '@/features/engagements/types'
import { mockApi, renderApp } from '@/test/render'

const acme: Engagement = {
  id: '6f1c5b0e-0000-4000-8000-000000000001',
  client_name: 'Acme Uganda Ltd',
  period_start: '2025-07-01',
  period_end: '2026-06-30',
  framework: 'ifrs',
  status: 'fieldwork',
  created_at: '2026-10-31T00:00:00Z',
  updated_at: '2026-10-31T00:00:00Z',
}
const health = { status: 'ok', database: true, worker: { ok: true, seen_at: null }, version: '0.1.0' }
const api = () =>
  mockApi((url) =>
    url.pathname === '/api/health'
      ? health
      : url.pathname === '/api/engagements'
        ? { items: [], total: 0, limit: 50, offset: 0 }
        : acme,
  )

describe('app shell', () => {
  it('shows the eight stages, done up to the current one', async () => {
    api()
    renderApp(`/engagements/${acme.id}/test/exceptions`)
    const spine = await screen.findByRole('navigation', { name: 'Audit stages' })
    const links = within(spine).getAllByRole('link')
    expect(links).toHaveLength(8)
    expect(links[4]).toHaveAttribute('data-state', 'done')
    expect(links[5]).toHaveAttribute('data-state', 'current')
    expect(links[5]).toHaveAttribute('aria-current', 'page')
    expect(links[6]).toHaveAttribute('data-state', 'upcoming')
    expect(screen.getByRole('link', { name: 'Exceptions' })).toHaveAttribute('aria-current', 'page')
  })

  it('opens the palette with Ctrl-K and turns a question into a run', async () => {
    api()
    const { router } = renderApp('/')
    await screen.findByRole('navigation', { name: 'Main' })
    await userEvent.keyboard('{Control>}k{/Control}')
    const input = await screen.findByPlaceholderText('Ask kebera, or type a screen')
    await userEvent.type(input, 'duplicate payments')
    await userEvent.keyboard('{Enter}')
    expect(router.state.location.pathname).toBe('/ask')
    expect(router.state.location.search).toBe('?q=duplicate%20payments')
  })

  it('moves through a queue with J and K and judges with R', async () => {
    api()
    renderApp('/design')
    const queue = await screen.findByRole('list', { name: 'Sample exception queue' })
    const items = () => within(queue).getAllByRole('listitem')
    expect(items()[0]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('jj')
    expect(items()[2]).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('k')
    expect(items()[1]).toHaveAttribute('aria-selected', 'true')
    await act(() => userEvent.keyboard('r'))
    expect(items()[1]).toHaveTextContent('right')
  })
})
