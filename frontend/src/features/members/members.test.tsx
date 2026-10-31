import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { mockSignedIn, renderApp } from '@/test/render'

import type { Member } from './types'

const ama: Member = {
  id: 'm1',
  user_id: 'u1',
  email: 'ama@mukasa.test',
  name: 'Ama Mukasa',
  role: 'partner',
  is_active: true,
  confirmed: true,
  has_password: true,
  locked: false,
  created_at: '2026-10-01T00:00:00Z',
  last_login_at: '2026-10-31T09:00:00Z',
  link_sent: false,
}

describe('people', () => {
  it('lists the firm and invites someone', async () => {
    let people = [ama]
    const fetchMock = mockSignedIn((url, init) => {
      if (url.pathname === '/api/members' && init?.method === 'POST') {
        const body = JSON.parse(String(init.body)) as { email: string; role: Member['role'] }
        const added = {
          ...ama,
          id: 'm2',
          user_id: 'u2',
          email: body.email,
          name: 'Kato',
          role: body.role,
          confirmed: false,
        }
        people = [...people, added]
        return added
      }
      return people
    })
    renderApp('/people')
    expect(await screen.findByText('(you)')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add person' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Email'), 'kato@mukasa.test')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Send invitation' }))
    expect(await screen.findByText('kato@mukasa.test')).toBeInTheDocument()
    expect(screen.getByText('Invited')).toBeInTheDocument()
    const call = fetchMock.mock.calls.find(([u, i]) => String(u) === '/api/members' && i?.method === 'POST')
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ email: 'kato@mukasa.test', role: 'staff' })
  })
})
