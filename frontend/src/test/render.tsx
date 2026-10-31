import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { vi } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { routes } from '@/app/router'

/** Render the whole app at a URL, with a fresh query cache that never retries. */
export function renderApp(url = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
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
