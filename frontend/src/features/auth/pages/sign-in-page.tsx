import { MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

import { useAuthOptions, useMe, useRequestLink, useSignup } from '../api'
import { AuthLayout } from '../components/auth-layout'
import { safeNext } from '../next'

type Mode = 'signin' | 'signup'

/** Sign in with an emailed link, or open a new firm. Both end on "check your email". */
export function SignInPage() {
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'signup' ? 'signup' : 'signin')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: me } = useMe()
  const { data: options } = useAuthOptions()
  const link = useRequestLink()
  const signup = useSignup()
  const pending = link.isPending || signup.isPending

  if (me && !me.password_step) return <Navigate to={next ?? '/'} replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email')).trim()
    try {
      if (mode === 'signup') {
        await signup.mutateAsync({
          email,
          name: String(form.get('name') ?? '').trim() || undefined,
          firm_name: String(form.get('firm_name')).trim(),
          next,
        })
      } else {
        await link.mutateAsync({ email, next })
      }
      setSentTo(email)
    } catch (err) {
      setError(err instanceof ApiError ? describe(err) : 'Could not reach the server. Try again.')
    }
  }

  if (sentTo) {
    const minutes = options?.link_minutes ?? 15
    return (
      <AuthLayout title="Check your email">
        <div className="flex gap-3">
          <MailCheck className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">
            If <span className="font-medium">{sentTo}</span> has a Kebera account, we've sent it a sign-in link. It
            works once, for {mode === 'signup' ? '24 hours' : `${minutes} minutes`}. Open it in this browser.
          </p>
        </div>
        <Button variant="link" className="mt-4 h-auto p-0" onClick={() => setSentTo(null)}>
          Use a different email
        </Button>
      </AuthLayout>
    )
  }

  const canSignUp = options?.signup ?? false
  return (
    <AuthLayout
      title={mode === 'signup' ? 'Open your firm on Kebera' : 'Sign in to Kebera'}
      description={
        mode === 'signup'
          ? 'You become its partner and can add your team after.'
          : 'We email you a link; there is no password to remember.'
      }
    >
      {canSignUp && (
        <div className="bg-muted mb-5 grid grid-cols-2 rounded-md p-1 text-sm" role="tablist">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m)
                setError(null)
              }}
              className={cn(
                'rounded px-3 py-1.5',
                mode === m ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground',
              )}
            >
              {m === 'signin' ? 'Sign in' : 'New firm'}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={onSubmit} className="grid gap-4">
        {mode === 'signup' && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="firm_name">Firm name</Label>
              <Input id="firm_name" name="firm_name" required maxLength={200} placeholder="Mukasa & Co" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" maxLength={120} autoComplete="name" />
            </div>
          </>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            autoFocus
            placeholder="you@firm.com"
          />
        </div>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : mode === 'signup' ? 'Open firm' : 'Email me a sign-in link'}
        </Button>
      </form>
    </AuthLayout>
  )
}

function describe(err: ApiError) {
  if (Array.isArray(err.detail)) return 'Check the email address.'
  return err.message
}
