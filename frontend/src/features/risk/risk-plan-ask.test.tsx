import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Engagement } from '@/features/engagements/types'
import { mockApi, renderApp } from '@/test/render'

const kagera: Engagement = {
  id: '6f1c5b0e-0000-4000-8000-000000000002',
  client_name: 'Kagera Dairies Ltd',
  period_start: '2025-07-01',
  period_end: '2026-06-30',
  framework: 'ifrs_sme',
  status: 'planning',
  created_at: '2026-10-31T00:00:00Z',
  updated_at: '2026-10-31T00:00:00Z',
}
const health = { status: 'ok', database: true, worker: { ok: true, seen_at: null }, version: '0.1.0' }
const api = () => mockApi((url) => (url.pathname === '/api/health' ? health : kagera))

describe('risk and control matrix', () => {
  it('counts rated areas and accepts the suggested ratings for the rest', async () => {
    api()
    renderApp(`/engagements/${kagera.id}/risk`)
    expect(await screen.findByRole('heading', { name: 'Where could the statements be wrong?' })).toBeInTheDocument()
    const sign = screen.getByRole('region', { name: 'Your call' })
    expect(within(sign).getByText(/3 of 7 areas rated/)).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Revenue: existence high, valuation medium, cut-off high/ }),
    ).toBeInTheDocument()

    await userEvent.click(within(sign).getByRole('button', { name: /Accept kebera's ratings/ }))
    expect(within(sign).getByText(/All 7 areas rated/)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Your rating for Borrowings' })).toHaveTextContent('Elevated')
    expect(within(sign).getByRole('link', { name: 'Draft the plan' })).toHaveAttribute(
      'href',
      `/engagements/${kagera.id}/plan`,
    )
  })
})

describe('audit plan', () => {
  it('resolves the comment and locks the plan on approval', async () => {
    api()
    renderApp(`/engagements/${kagera.id}/plan`)
    expect(await screen.findByRole('heading', { name: /Audit plan: Kagera Dairies Ltd/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Audit plan' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText(/Add inventory as a significant risk/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Resolve 1 comment' }))
    expect(screen.queryByText(/Add inventory as a significant risk/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Approve plan' }))
    expect(screen.getByRole('button', { name: 'Plan approved' })).toBeDisabled()
    expect(screen.getByText('Approved · locked')).toBeInTheDocument()
  })
})

describe('ask a run', () => {
  it('shows the question from the palette, the plan, the answer and the receipt', async () => {
    api()
    renderApp('/ask?q=duplicate%20payments')
    expect(await screen.findByRole('textbox', { name: 'Ask kebera' })).toHaveValue('duplicate payments')
    expect(screen.getByText('Plan · step 5 of 6')).toBeInTheDocument()
    expect(screen.getByText('PV-2026-0611')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open all 13 in the exception queue/ })).toBeInTheDocument()
    expect(within(screen.getByLabelText('Run receipt')).getByText('r-0402')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(screen.getByText('Stopped at step 5 of 6')).toBeInTheDocument()
  })
})
