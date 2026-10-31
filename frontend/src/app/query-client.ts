import { QueryCache, QueryClient } from '@tanstack/react-query'

import { authKeys } from '@/features/auth/api'
import { ApiError } from '@/lib/api-client'

export function makeQueryClient(options: { retry?: boolean } = {}) {
  const client: QueryClient = new QueryClient({
    // A 401 anywhere means the session ended (signed out elsewhere, removed from the firm, expired):
    // forget who we were, and the route guard sends the person to sign in.
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof ApiError && error.status === 401 && query.queryKey[0] !== 'auth') {
          client.setQueryData(authKeys.me, null)
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A 4xx will not fix itself; only retry network and server errors.
        retry:
          options.retry === false
            ? false
            : (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      },
      mutations: options.retry === false ? { retry: false } : undefined,
    },
  })
  return client
}
