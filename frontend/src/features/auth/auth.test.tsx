import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { mockSignedIn, partner, renderApp } from '@/test/render'

import type { Me } from './types'

const page = { items: [], total: 0, limit: 50, offset: 0 }

describe('sign-in', () => {
  it('sends a signed-out visitor to sign in, remembering where they were going', async () => {
    mockSignedIn(() => page, null)
    const { router } = renderApp('/engagements/abc')
    expect(await screen.findByRole('heading', { name: 'Sign in to Kebera' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/signin')
    expect(router.state.location.search).toBe('?next=%2Fengagements%2Fabc')
  })

  it('emails a link and says to check the inbox', async () => {
    const fetchMock = mockSignedIn(() => ({ sent: true }), null)
    renderApp('/signin')
    await userEvent.type(await screen.findByLabelText('Work email'), 'ama@mukasa.test')
    await userEvent.click(screen.getByRole('button', { name: 'Email me a sign-in link' }))
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    const call = fetchMock.mock.calls.find(([u]) => String(u) === '/api/auth/link')
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ email: 'ama@mukasa.test' })
  })

  it('opens a new firm', async () => {
    const fetchMock = mockSignedIn(() => ({ sent: true }), null)
    renderApp('/signin')
    await userEvent.click(await screen.findByRole('tab', { name: 'New firm' }))
    await userEvent.type(screen.getByLabelText('Firm name'), 'Mukasa & Co')
    await userEvent.type(screen.getByLabelText('Work email'), 'ama@mukasa.test')
    await userEvent.click(screen.getByRole('button', { name: 'Open firm' }))
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    const call = fetchMock.mock.calls.find(([u]) => String(u) === '/api/auth/signup')
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ firm_name: 'Mukasa & Co' })
  })

  it('opens the emailed link, then a partner chooses a password', async () => {
    let me: Me | null = null
    const fetchMock = mockSignedIn((url) => {
      if (url.pathname === '/api/auth/verify') {
        me = { ...partner, permissions: [], password_step: 'set' }
        return { token: 't', me }
      }
      if (url.pathname === '/api/auth/password') {
        me = partner
        return me
      }
      return page
    }, null)
    renderApp('/auth/verify?token=abc')
    expect(await screen.findByRole('heading', { name: 'Choose your password' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([u]) => String(u) === '/api/auth/verify')).toHaveLength(1)

    await userEvent.type(screen.getByLabelText('New password'), 'a long enough password')
    await userEvent.type(screen.getByLabelText('Type it again'), 'a long enough password')
    await userEvent.click(screen.getByRole('button', { name: 'Save and continue' }))
    expect(await screen.findByRole('heading', { name: 'Engagements' })).toBeInTheDocument()
    expect(screen.getByText('Mukasa & Co')).toBeInTheDocument()
  })

  it('says when a link has expired', async () => {
    mockSignedIn(
      () => Response.json({ detail: 'this link has expired or was already used; ask for a new one' }, { status: 401 }),
      null,
    )
    renderApp('/auth/verify?token=old')
    expect(await screen.findByRole('heading', { name: "This link didn't work" })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get a new sign-in link' })).toBeInTheDocument()
  })

  it('switches between firms', async () => {
    const two: Me = {
      ...partner,
      firms: [partner.firm!, { id: 'f2', name: 'Okello Associates', role: 'manager' }],
    }
    mockSignedIn(() => page, two)
    renderApp('/')
    expect(await screen.findByRole('combobox', { name: 'Firm' })).toHaveTextContent('Mukasa & Co')
  })

  it('signs out', async () => {
    const fetchMock = mockSignedIn(() => new Response(null, { status: 204 }))
    renderApp('/')
    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { name: 'Sign in to Kebera' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([u]) => String(u) === '/api/auth/logout')).toBe(true)
  })
})
