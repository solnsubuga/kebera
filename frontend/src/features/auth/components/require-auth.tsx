import { Navigate, Outlet, useLocation } from 'react-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useMe, useSignOut } from '../api'
import { AuthLayout } from './auth-layout'

/** Wraps every signed-in page: sends people to sign in, to their password step, or explains when they
 * belong to no firm. */
export function RequireAuth() {
  const { data: me, isPending, isError, refetch } = useMe()
  const location = useLocation()
  const signOut = useSignOut()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center p-8">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }
  if (isError) {
    return (
      <AuthLayout title="Kebera is unreachable" description="The server did not answer.">
        <Button onClick={() => void refetch()}>Try again</Button>
      </AuthLayout>
    )
  }
  const here = location.pathname + location.search
  if (me === null) {
    const next = here === '/' ? '' : `?next=${encodeURIComponent(here)}`
    return <Navigate to={`/signin${next}`} replace />
  }
  if (me.password_step) {
    return <Navigate to={`/signin/password?next=${encodeURIComponent(here)}`} replace />
  }
  if (!me.firm) {
    return (
      <AuthLayout
        title="You're not in a firm"
        description={`${me.user.email} is not a member of any firm on Kebera. Ask a partner of your firm to add you.`}
      >
        <Button variant="outline" onClick={() => signOut.mutate()}>
          Sign out
        </Button>
      </AuthLayout>
    )
  }
  return <Outlet />
}
