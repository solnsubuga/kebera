import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api-client'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A 4xx will not fix itself; only retry network and server errors.
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      },
    },
  })
}
