import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, qs } from '@/lib/api-client'

import type { Engagement, EngagementCreate, EngagementStatus, EngagementUpdate, Page } from './types'

/** Query keys in one place, so mutations invalidate exactly what they change. */
export const engagementKeys = {
  all: ['engagements'] as const,
  list: (status?: EngagementStatus) => [...engagementKeys.all, 'list', { status }] as const,
  detail: (id: string) => [...engagementKeys.all, 'detail', id] as const,
}

export const engagementsQuery = (status?: EngagementStatus) =>
  queryOptions({
    queryKey: engagementKeys.list(status),
    queryFn: ({ signal }) => api.get<Page<Engagement>>(`/engagements${qs({ status })}`, signal),
    placeholderData: keepPreviousData,
  })

export const engagementQuery = (id: string) =>
  queryOptions({
    queryKey: engagementKeys.detail(id),
    queryFn: ({ signal }) => api.get<Engagement>(`/engagements/${id}`, signal),
  })

export const useEngagements = (status?: EngagementStatus) => useQuery(engagementsQuery(status))
export const useEngagement = (id: string) => useQuery(engagementQuery(id))

export function useCreateEngagement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EngagementCreate) => api.post<Engagement>('/engagements', body),
    onSuccess: (created) => {
      qc.setQueryData(engagementKeys.detail(created.id), created)
      return qc.invalidateQueries({ queryKey: engagementKeys.all })
    },
  })
}

export function useUpdateEngagement(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EngagementUpdate) => api.patch<Engagement>(`/engagements/${id}`, body),
    onSuccess: (updated) => {
      qc.setQueryData(engagementKeys.detail(id), updated)
      return qc.invalidateQueries({ queryKey: engagementKeys.all })
    },
  })
}
