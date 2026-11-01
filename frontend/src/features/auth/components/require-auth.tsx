import { Navigate, Outlet, useLocation } from 'react-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useMe, useSignOut } from '../api'
import { AuthLayout } from './auth-layout'

/** Wraps every signed-in screen: no session goes to /signin (which also asks partners for their
 * password), and someone in no firm is told so. */
export function RequireAuth() {
  const { data: me, isPending, isError, refetch } = useMe()
  const location = useLocation()
  const signOut = useSignOut()

  if (isPending) {
    return (
      <div className="bg-ground flex min-h-svh items-center justify-center p-8">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }
  if (isError) {
    return (
      <AuthLayout title="Can't reach the server" description="Check your connection, then try again.">
        <Button onClick={() => void refetch()}>Try again</Button>
      </AuthLayout>
    )
  }
  if (me === null || me.password_step) {
    const here = location.pathname + location.search
    return <Navigate to={here === '/' ? '/signin' : `/signin?next=${encodeURIComponent(here)}`} replace />
  }
  if (!me.firm) {
    return (
      <AuthLayout
        title="You're not in a firm yet"
        description={`${me.user.email} isn't a member of any firm. Ask a partner at your firm to add you.`}
      >
        <Button variant="secondary" onClick={() => signOut.mutate()}>
          Sign out
        </Button>
      </AuthLayout>
    )
  }
  return <Outlet />
}
