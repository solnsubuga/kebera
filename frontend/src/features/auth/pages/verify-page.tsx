import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api-client'

import { useVerify } from '../api'
import { AuthLayout } from '../components/auth-layout'
import { safeNext } from '../next'

/** Where the emailed link lands: trades its token for a session, then moves on. */
export function VerifyPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const next = safeNext(params.get('next')) ?? '/'
  const verify = useVerify()
  const navigate = useNavigate()
  const started = useRef(false)

  useEffect(() => {
    if (started.current || !token) return
    started.current = true // a link works once, so never send it twice (React runs effects twice in dev)
    verify.mutate(token, {
      onSuccess: ({ me }) => {
        const to = me.password_step ? `/signin?next=${encodeURIComponent(next)}` : next
        void navigate(to, { replace: true })
      },
    })
  }, [token, next, verify, navigate])

  if (!token || verify.isError) {
    const message =
      verify.error instanceof ApiError
        ? verify.error.message
        : verify.error
          ? 'Could not reach the server.'
          : 'This link is incomplete.'
    return (
      <AuthLayout title="This link didn't work" description={capitalise(message)}>
        <Link to="/signin" className="text-link text-sm hover:underline">
          Get a new sign-in link
        </Link>
      </AuthLayout>
    )
  }
  return (
    <AuthLayout title="Signing you in…">
      <Skeleton className="h-9 w-full" />
    </AuthLayout>
  )
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1) + (s.endsWith('.') ? '' : '.')
}
