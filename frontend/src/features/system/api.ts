import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

export type Health = {
  status: 'ok' | 'degraded'
  database: boolean
  worker: { ok: boolean; seen_at: string | null }
  version: string
}

export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => api.get<Health>('/health', signal),
    refetchInterval: 60_000,
    retry: false,
  })
