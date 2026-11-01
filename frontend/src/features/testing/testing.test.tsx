import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { mockApi, renderApp } from '@/test/render'

const id = '6f1c5b0e-0000-4000-8000-0000000000a1'
const kagera = {
  id,
  client_name: 'Kagera Dairies Ltd',
  period_start: '2025-07-01',
  period_end: '2026-06-30',
  framework: 'ifrs_sme',
  status: 'fieldwork',
  created_at: '2026-10-31T00:00:00Z',
  updated_at: '2026-10-31T00:00:00Z',
}
const health = { status: 'ok', database: true, worker: { ok: true, seen_at: null }, version: '0.1.0' }

function open(tab: string) {
  mockApi((url) => (url.pathname === '/api/health' ? health : kagera))
  return renderApp(`/engagements/${id}/test/${tab}`)
}

describe('test stage', () => {
  it('sums the exceptions from the tests, leaving signals out', async () => {
    open('tests')
    expect(await screen.findByText(/37 exceptions wait for your judgment/)).toBeInTheDocument()
    expect(screen.getByText(/3 signals for the risk score/)).toBeInTheDocument()
    expect(screen.getByText('2.9 points high')).toBeInTheDocument()
  })

  it('moves a judged exception out of the queue with the R key', async () => {
    open('exceptions')
    const queue = await screen.findByRole('complementary', { name: 'Exception queue' })
    expect(within(queue).getByText('Open 11')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /UGX 96,000,000/ })).toBeInTheDocument()

    await userEvent.keyboard('r')
    expect(within(queue).getByText('Open 10')).toBeInTheDocument()
    expect(within(queue).getByText('PV-0611 · right · GA')).toBeInTheDocument()
    // The next exception is selected.
    expect(screen.getByRole('heading', { name: 'Lwera Feeds · over limit, no note' })).toBeInTheDocument()
  })

  it('keeps a note typed on the sign line with the judgment', async () => {
    open('exceptions')
    await userEvent.type(await screen.findByLabelText('Note'), 'GRN found later')
    await userEvent.click(screen.getByRole('button', { name: /Wrong/ }))
    expect(screen.getByText('PV-0611 · wrong: GRN found later · GA')).toBeInTheDocument()
  })

  it('signs a workpaper as reviewer', async () => {
    open('workpapers')
    await userEvent.click(await screen.findByRole('button', { name: 'Sign as reviewer' }))
    expect(screen.getByRole('button', { name: 'Signed as reviewer' })).toBeDisabled()
  })
})
