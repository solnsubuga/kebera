import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, qs } from '@/lib/api-client'

import type { AuditEvent, Member, MemberCreate, MemberPatch } from './types'

export const memberKeys = {
  all: ['members'] as const,
  audit: ['audit'] as const,
}

export const membersQuery = () =>
  queryOptions({ queryKey: memberKeys.all, queryFn: ({ signal }) => api.get<Member[]>('/members', signal) })

export const useMembers = () => useQuery(membersQuery())

export const useAudit = () =>
  useQuery({
    queryKey: memberKeys.audit,
    queryFn: ({ signal }) => api.get<AuditEvent[]>(`/audit${qs({ limit: 200 })}`, signal),
  })

export function useAddMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: MemberCreate) => api.post<Member>('/members', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: memberKeys.all }),
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: MemberPatch & { id: string }) => api.patch<Member>(`/members/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: memberKeys.all }),
  })
}
