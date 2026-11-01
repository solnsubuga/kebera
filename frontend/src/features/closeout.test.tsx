import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Engagement } from '@/features/engagements/types'
import { mockApi, renderApp } from '@/test/render'

const kagera: Engagement = {
  id: '6f1c5b0e-0000-4000-8000-00000000000k',
  client_name: 'Kagera Dairies Ltd',
  period_start: '2025-07-01',
  period_end: '2026-06-30',
  framework: 'ifrs_sme',
  status: 'completion',
  created_at: '2026-10-31T00:00:00Z',
  updated_at: '2026-10-31T00:00:00Z',
}
const health = { status: 'ok', database: true, worker: { ok: true, seen_at: null }, version: '0.1.0' }
const api = () =>
  mockApi((url) =>
    url.pathname === '/api/health'
      ? health
      : url.pathname === '/api/engagements'
        ? { items: [kagera], total: 1, limit: 50, offset: 0 }
        : kagera,
  )
const at = (path: string) => `/engagements/${kagera.id}${path}`

describe('client requests', () => {
  it('previews the selected draft and moves with J and K', async () => {
    api()
    renderApp(at('/test/requests'))
    const preview = await screen.findByRole('complementary', { name: 'What the client will see' })
    expect(within(preview).getByText('Can you explain the June sales of UGX 2.1bn?')).toBeInTheDocument()
    await userEvent.keyboard('j')
    expect(
      within(preview).getByText('What supports the 18% sales growth in your cash flow forecast?'),
    ).toBeInTheDocument()
  })

  it('sends the drafts from the sign line', async () => {
    api()
    renderApp(at('/test/requests'))
    await userEvent.click(await screen.findByRole('button', { name: 'Send 2 requests' }))
    expect(await screen.findByText(/All drafted requests are sent/)).toBeInTheDocument()
    expect(screen.queryByText('Drafted by kebera')).not.toBeInTheDocument()
  })
})

describe('client phone', () => {
  it('shows each delivery note and sends what the client has', async () => {
    renderApp('/c/demo')
    expect(await screen.findByText('This note is dated 3 July. Was it delivered in June?')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Send what I have' }))
    expect(screen.getByRole('status')).toHaveTextContent('Sent.')
  })
})

describe('misstatements', () => {
  it('totals the uncorrected errors and records the conclusion', async () => {
    api()
    renderApp(at('/evaluate'))
    expect(await screen.findByRole('heading', { name: /Uncorrected errors add up to UGX 104\.2m/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Conclude: not material' }))
    const line = screen.getByRole('region', { name: 'Your call' })
    expect(within(line).getByText(/concluded not material/)).toBeInTheDocument()
    expect(within(line).queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('report', () => {
  it('shows the management letter and hands off to the partner', async () => {
    api()
    renderApp(at('/report'))
    expect(
      await screen.findByRole('heading', { name: 'Letter to the Board of Kagera Dairies Ltd' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Management letter' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('link', { name: 'Send to partner' }))
    expect(
      await screen.findByRole('heading', { name: 'Kagera Dairies is ready for your signature' }),
    ).toBeInTheDocument()
  })
})

describe('partner sign-off', () => {
  it('is outside the app shell and records the signature', async () => {
    renderApp(at('/report/sign'))
    await userEvent.click(await screen.findByRole('button', { name: 'Sign as D. Okello' }))
    expect(screen.getByRole('status')).toHaveTextContent('Signed as D. Okello')
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
  })
})

describe('trust', () => {
  it('lists measured accuracy per test', async () => {
    api()
    renderApp('/trust')
    expect(await screen.findByRole('heading', { name: 'Can we rely on kebera?' })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Split payments under a limit/ })).toHaveTextContent('Use with review')
  })
})
