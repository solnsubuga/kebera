import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, ApiError } from '@/lib/api-client'

import type { AuthOptions, Me, Permission } from './types'

export const authKeys = {
  me: ['auth', 'me'] as const,
  options: ['auth', 'options'] as const,
}

/** Who is signed in, or null when nobody is. Every other query hangs off this one. */
export const meQuery = () =>
  queryOptions({
    queryKey: authKeys.me,
    queryFn: async ({ signal }) => {
      try {
        return await api.get<Me>('/auth/me', signal)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null
        throw err
      }
    },
    staleTime: 5 * 60_000,
  })

export const useMe = () => useQuery(meQuery())

export const useAuthOptions = () =>
  useQuery({
    queryKey: authKeys.options,
    queryFn: ({ signal }) => api.get<AuthOptions>('/auth/options', signal),
    staleTime: Infinity,
  })

/** Whether the signed-in person may do something in their current firm. */
export function useCan(permission: Permission) {
  const { data } = useMe()
  return data?.permissions.includes(permission) ?? false
}

export const useRequestLink = () =>
  useMutation({ mutationFn: (body: { email: string; next?: string }) => api.post('/auth/link', body) })

export const useSignup = () =>
  useMutation({
    mutationFn: (body: { email: string; name?: string; firm_name: string; next?: string }) =>
      api.post('/auth/signup', body),
  })

/** After anything that changes who you are or which firm you're in: forget every cached answer. */
function useReplaceMe() {
  const qc = useQueryClient()
  return (me: Me | null) => {
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' })
    qc.setQueryData(authKeys.me, me)
  }
}

export function useVerify() {
  const replace = useReplaceMe()
  return useMutation({
    mutationFn: (token: string) => api.post<{ token: string; me: Me }>('/auth/verify', { token }),
    onSuccess: ({ me }) => replace(me),
  })
}

export function usePasswordStep() {
  const replace = useReplaceMe()
  return useMutation({
    mutationFn: (password: string) => api.post<Me>('/auth/password', { password }),
    onSuccess: replace,
  })
}

export function useSwitchFirm() {
  const replace = useReplaceMe()
  return useMutation({
    mutationFn: (firmId: string) => api.post<Me>('/auth/firm', { firm_id: firmId }),
    onSuccess: replace,
  })
}

export function useSignOut() {
  const replace = useReplaceMe()
  return useMutation({
    mutationFn: () => api.post('/auth/logout', {}),
    onSettled: () => replace(null),
  })
}
