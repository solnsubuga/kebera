import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { BRAND } from '@/lib/brand'
import { mockApi, renderApp } from '@/test/render'

import type { Engagement } from './types'

const kagera: Engagement = {
  id: '6f1c5b0e-0000-4000-8000-00000000000a',
  client_name: 'Kagera Dairies Ltd',
  period_start: '2025-07-01',
  period_end: '2026-06-30',
  framework: 'ifrs_sme',
  status: 'fieldwork',
  created_at: '2026-10-31T00:00:00Z',
  updated_at: '2026-10-31T00:00:00Z',
}

const health = { status: 'ok', database: true, worker: { ok: true, seen_at: null }, version: '0.1.0' }

function api() {
  return mockApi((url) => {
    if (url.pathname === '/api/health') return health
    if (url.pathname === '/api/engagements') return { items: [kagera], total: 1, limit: 50, offset: 0 }
    return kagera
  })
}

describe('engagements home', () => {
  it('shows the stage and sample figures, and links queue items to the client', async () => {
    api()
    renderApp('/')
    const row = (await screen.findByRole('link', { name: 'Kagera Dairies Ltd' })).closest('tr')!
    expect(within(row).getByText('Test')).toBeInTheDocument()
    expect(within(row).getByText('104 / 135m')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /11 exceptions to judge/ })).toHaveAttribute(
      'href',
      `/engagements/${kagera.id}/test/exceptions`,
    )
    // Mbarara Transit has no engagement here, so its item is not a link.
    expect(screen.queryByRole('link', { name: /Approve the audit plan/ })).not.toBeInTheDocument()
  })
})

describe('setup stages', () => {
  it('records the acceptance decision on the sign line', async () => {
    api()
    renderApp(`/engagements/${kagera.id}/accept`)
    expect(await screen.findByRole('heading', { name: 'Should we take on Kagera Dairies?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Accept with condition' }))
    expect(screen.getByText(/Accepted on condition the clearance arrives/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Accept and send letter' })).not.toBeInTheDocument()
  })

  it('shows the tie-out with the reconciling items', async () => {
    api()
    renderApp(`/engagements/${kagera.id}/connect`)
    expect(await screen.findByText(`${BRAND} found 2 reconciling items that explain all of it`)).toBeInTheDocument()
    expect(screen.getByText('3,200,000')).toBeInTheDocument()
  })

  it('switches control areas in the folder review', async () => {
    api()
    renderApp(`/engagements/${kagera.id}/understand`)
    expect(await screen.findByText("J. Mugisha's declaration")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Payroll/ }))
    expect(screen.queryByText("J. Mugisha's declaration")).not.toBeInTheDocument()
  })

  it('recomputes materiality from the chosen benchmark and shares', async () => {
    api()
    renderApp(`/engagements/${kagera.id}/materiality`)
    expect(await screen.findByText('180,000,000')).toBeInTheDocument()
    expect(screen.getByText('135,000,000')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /1% of revenue/ }))
    expect(screen.getByText('124,120,000')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '50%' }))
    expect(screen.getByText('62,060,000')).toBeInTheDocument()
  })
})
