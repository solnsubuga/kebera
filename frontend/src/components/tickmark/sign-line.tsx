import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type SignedRecord = { by: string; at: string; reason?: string }

type SignLineProps = {
  /** What is being decided, in a few words. */
  label?: ReactNode
  /** kebera's suggestion and what the person chooses. */
  children?: ReactNode
  /** The buttons. Put the committing action last. */
  actions?: ReactNode
  /** Once decided: who, when and why. Replaces the actions. */
  signed?: SignedRecord
  /** Pin it to the bottom of the scroll area on frosted glass. */
  sticky?: boolean
  className?: string
}

/**
 * The one place a person commits a judgment. One dashed rule per screen, one decision on it.
 * Above it is kebera's work; on it, a name, a time and a reason are recorded.
 */
export function SignLine({ label = 'Your call', children, actions, signed, sticky, className }: SignLineProps) {
  return (
    <section
      aria-label={typeof label === 'string' ? label : 'Sign line'}
      className={cn(
        'border-ink flex flex-wrap items-center gap-x-4 gap-y-3 border-t-[1.5px] border-dashed pt-3.5',
        sticky && 'bg-frost frosted sticky bottom-0 z-10 px-6 pb-3.5',
        className,
      )}
    >
      <span className="text-ink text-[13px] font-semibold">{label}</span>
      <div className="min-w-60 flex-1 text-sm">{children}</div>
      {signed ? (
        <p className="text-ink-soft flex items-center gap-2 text-[13px]">
          <span className="bg-ink text-on-ink inline-flex size-5 items-center justify-center rounded-full font-mono text-[11px] font-semibold">
            S
          </span>
          <span>
            <b className="text-ink font-medium">{signed.by}</b> · {signed.at}
            {signed.reason && <> · {signed.reason}</>}
          </span>
        </p>
      ) : (
        actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </section>
  )
}
