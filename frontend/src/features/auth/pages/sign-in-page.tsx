import { MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api-client'

import { useAuthOptions, useMe, usePasswordStep, useRequestLink, useSignOut, useSignup } from '../api'
import { AuthLayout } from '../components/auth-layout'
import { safeNext } from '../next'
import type { Me } from '../types'

const MIN_PASSWORD = 12

/**
 * The one sign-in screen. Ask for an email and send a link; after the link, a partner enters their password
 * here too. "Open a firm" is the same form with the firm's name.
 */
export function SignInPage() {
  const [params] = useSearchParams()
  const next = safeNext(params.get('next')) ?? '/'
  const { data: me, isPending } = useMe()

  if (isPending) return null
  if (me?.password_step) return <PasswordStep me={me} next={next} />
  if (me) return <Navigate to={next} replace />
  return <EmailStep next={next} />
}

function EmailStep({ next }: { next: string }) {
  const [opening, setOpening] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: options } = useAuthOptions()
  const link = useRequestLink()
  const signup = useSignup()
  const pending = link.isPending || signup.isPending
  const nextParam = next === '/' ? undefined : next

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email')).trim()
    try {
      if (opening) {
        await signup.mutateAsync({ email, firm_name: String(form.get('firm_name')).trim(), next: nextParam })
      } else {
        await link.mutateAsync({ email, next: nextParam })
      }
      setSentTo(email)
    } catch (err) {
      setError(
        err instanceof ApiError && !Array.isArray(err.detail) ? sentence(err.message) : 'Check the email address.',
      )
    }
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your email">
        <div className="flex gap-3">
          <MailCheck className="text-link mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">
            If <span className="font-medium">{sentTo}</span> has an account, a sign-in link is on its way. It works
            once, for {opening ? '24 hours' : `${options?.link_minutes ?? 15} minutes`}. Open it in this browser.
          </p>
        </div>
        <Button variant="link" className="mt-5 h-auto p-0" onClick={() => setSentTo(null)}>
          Use a different email
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={opening ? 'Open your firm' : 'Sign in'}
      description={
        opening ? 'You become its partner and add your team after.' : 'We email you a link. There is no password.'
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        {opening && (
          <div className="grid gap-2">
            <Label htmlFor="firm_name">Firm name</Label>
            <Input id="firm_name" name="firm_name" required maxLength={200} placeholder="Nakato & Partners" />
          </div>
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
            placeholder="you@firm.co.ug"
          />
        </div>
        {error && (
          <p role="alert" className="text-vermilion text-sm">
            {error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : opening ? 'Open firm' : 'Email me a link'}
        </Button>
      </form>
      {options?.signup && (
        <p className="text-ink-muted border-rule-soft mt-5 border-t pt-4 text-center text-[13px]">
          {opening ? 'Already have an account? ' : 'New to kebera? '}
          <button
            type="button"
            className="text-link hover:underline"
            onClick={() => {
              setOpening(!opening)
              setError(null)
            }}
          >
            {opening ? 'Sign in' : 'Open your firm'}
          </button>
        </p>
      )}
    </AuthLayout>
  )
}

/** A partner's second step after the link: choose a password the first time, enter it after that. */
function PasswordStep({ me, next }: { me: Me; next: string }) {
  const step = usePasswordStep()
  const signOut = useSignOut()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
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
      setError(err instanceof ApiError ? sentence(err.message) : 'Could not reach the server.')
    }
  }

  return (
    <AuthLayout
      title={choosing ? 'Choose a password' : 'Enter your password'}
      description={
        choosing
          ? `Partners sign opinions, so they also use a password. At least ${MIN_PASSWORD} characters.`
          : `Signing in as ${me.user.email}.`
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <input type="email" name="username" value={me.user.email} autoComplete="username" readOnly hidden />
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={choosing ? MIN_PASSWORD : undefined}
            autoComplete={choosing ? 'new-password' : 'current-password'}
            autoFocus
          />
        </div>
        {choosing && (
          <div className="grid gap-2">
            <Label htmlFor="confirm">Again</Label>
            <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
          </div>
        )}
        {error && (
          <p role="alert" className="text-vermilion text-sm">
            {error}
          </p>
        )}
        <Button type="submit" disabled={step.isPending}>
          {step.isPending ? 'Checking…' : 'Continue'}
        </Button>
      </form>
      <p className="text-ink-muted border-rule-soft mt-5 border-t pt-4 text-center text-[13px]">
        Not you?{' '}
        <button type="button" className="text-link hover:underline" onClick={() => signOut.mutate()}>
          Sign out
        </button>
      </p>
    </AuthLayout>
  )
}

function sentence(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1) + (s.endsWith('.') ? '' : '.')
}
