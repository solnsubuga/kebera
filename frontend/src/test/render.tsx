import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { vi } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { makeQueryClient } from '@/app/query-client'
import { routes } from '@/app/router'
import type { Me } from '@/features/auth/types'

/** Render the whole app at a URL, with a fresh query cache that never retries. */
export function renderApp(url = '/') {
  const client = makeQueryClient({ retry: false })
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  return {
    router,
    ...render(
      <AppProviders client={client}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  }
}

type Handler = (url: URL, init: RequestInit | undefined) => unknown

/** Stub fetch with a function from request to JSON body (or a Response for errors). */
export function mockApi(handler: Handler) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost')
    const out = await handler(url, init)
    return out instanceof Response ? out : Response.json(out)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export const health = { status: 'ok', database: true, worker: { ok: true, seen_at: null }, version: '0.1.0' }

export const partner: Me = {
  user: { id: 'u1', email: 'ama@mukasa.test', name: 'Ama Mukasa' },
  firm: { id: 'f1', name: 'Mukasa & Co', role: 'partner' },
  firms: [{ id: 'f1', name: 'Mukasa & Co', role: 'partner' }],
  permissions: ['audit.read', 'engagements.read', 'engagements.sign', 'engagements.write', 'members.manage'],
  password_step: null,
}

export const staff: Me = {
  ...partner,
  user: { id: 'u2', email: 'kato@mukasa.test', name: 'Kato' },
  firm: { id: 'f1', name: 'Mukasa & Co', role: 'staff' },
  firms: [{ id: 'f1', name: 'Mukasa & Co', role: 'staff' }],
  permissions: ['engagements.read'],
}

/** mockApi for a signed-in app: answers /api/auth/me with `me` (null: signed out, 401) and /api/health. */
export function mockSignedIn(handler: Handler, me: Me | null = partner) {
  return mockApi((url, init) => {
    if (url.pathname === '/api/health') return health
    if (url.pathname === '/api/auth/me') {
      return me ? me : Response.json({ detail: 'sign in required' }, { status: 401 })
    }
    if (url.pathname === '/api/auth/options') return { signup: true, link_minutes: 15 }
    return handler(url, init)
  })
}
