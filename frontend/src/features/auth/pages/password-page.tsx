import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api-client'

import { useMe, usePasswordStep, useSignOut } from '../api'
import { AuthLayout } from '../components/auth-layout'
import { safeNext } from '../next'

const MIN = 12

/** A partner's second step after the link: choose a password the first time, enter it after that. */
export function PasswordPage() {
  const [params] = useSearchParams()
  const next = safeNext(params.get('next')) ?? '/'
  const { data: me, isPending } = useMe()
  const step = usePasswordStep()
  const signOut = useSignOut()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  if (isPending) return null
  if (!me) return <Navigate to="/signin" replace />
  if (!me.password_step) return <Navigate to={next} replace />
  const choosing = me.password_step === 'set'

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password'))
    if (choosing && password !== String(form.get('confirm'))) {
      setError('The two passwords are different.')
      return
    }
    try {
      await step.mutateAsync(password)
      void navigate(next, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && err.message !== 'wrong password') {
        void navigate('/signin', { replace: true }) // the session ended (too many tries, or it timed out)
        return
      }
      setError(err instanceof ApiError ? capitalise(err.message) : 'Could not reach the server.')
    }
  }

  return (
    <AuthLayout
      title={choosing ? 'Choose your password' : 'Enter your password'}
      description={
        choosing
          ? `As a partner you sign engagements and manage people, so you also use a password. At least ${MIN} characters.`
          : `Signing in as ${me.user.email}.`
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <input type="email" name="username" value={me.user.email} autoComplete="username" readOnly hidden />
        <div className="grid gap-2">
          <Label htmlFor="password">{choosing ? 'New password' : 'Password'}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={choosing ? MIN : undefined}
            autoComplete={choosing ? 'new-password' : 'current-password'}
            autoFocus
          />
        </div>
        {choosing && (
          <div className="grid gap-2">
            <Label htmlFor="confirm">Type it again</Label>
            <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
          </div>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <Button type="submit" disabled={step.isPending}>
          {step.isPending ? 'Checking…' : choosing ? 'Save and continue' : 'Continue'}
        </Button>
        <Button type="button" variant="link" className="h-auto p-0" onClick={() => signOut.mutate()}>
          Not you? Sign out
        </Button>
      </form>
    </AuthLayout>
  )
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1) + (s.endsWith('.') ? '' : '.')
}
