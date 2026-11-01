import type { ReactNode } from 'react'

import { BRAND } from '@/lib/brand'

/** The signed-out frame: the brand mark from the rail, one white sheet on the grey ground. */
export function AuthLayout(props: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-ground flex min-h-svh flex-col items-center px-4 pt-16 pb-10 md:pt-28">
      <div className="mb-6 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-[9px] bg-gradient-to-b from-[#2c2c2e] to-[#1d1d1f] font-mono text-[16px] font-semibold text-white"
        >
          {BRAND[0]}
        </span>
        <span className="text-[17px] font-semibold">{BRAND}</span>
      </div>
      <main className="bg-sheet rounded-card shadow-card w-full max-w-[380px] p-7">
        <h1 className="text-[19px] font-semibold tracking-tight">{props.title}</h1>
        {props.description && <p className="text-ink-muted mt-1.5 text-sm">{props.description}</p>}
        <div className="mt-6">{props.children}</div>
      </main>
      <p className="text-ink-muted mt-6 max-w-[380px] text-center text-xs">
        Each firm sees only its own engagements. {BRAND} does the evidence work; a licensed auditor decides and signs.
      </p>
    </div>
  )
}
