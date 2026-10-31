import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { useCommandPalette } from '@/components/command/command-context'
import type { Engagement } from '@/features/engagements/types'
import { FRAMEWORKS } from '@/features/engagements/types'
import { BRAND } from '@/lib/brand'
import { formatDate } from '@/lib/format'

import { StageSpine } from './stage-spine'
import { STATUS_STAGE, type StageKey } from './stages'

type EngagementHeaderProps = {
  engagement: Pick<Engagement, 'id' | 'client_name' | 'period_end' | 'framework' | 'status'>
  /** The stage the audit has reached. Defaults to the one implied by its phase. */
  stage?: StageKey
  /** The stage on screen. */
  viewing?: StageKey
  /** Extra chips or buttons at the right, before Ask. */
  actions?: ReactNode
}

/** Breadcrumb, client, period and framework, then the eight-stage spine. */
export function EngagementHeader({ engagement: e, stage, viewing, actions }: EngagementHeaderProps) {
  const { setOpen } = useCommandPalette()
  return (
    <div className="bg-sheet">
      <header className="border-rule-soft flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <Link to="/" className="text-ink-muted hover:text-ink text-xs">
            Engagements
          </Link>
          <span className="text-ink-muted text-xs" aria-hidden="true">
            /
          </span>
          <h1 className="text-[15px] font-semibold">{e.client_name}</h1>
          <span className="text-ink-muted text-xs">
            Year end {formatDate(e.period_end)} · {FRAMEWORKS[e.framework]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Ask {BRAND}
          </Button>
        </div>
      </header>
      <StageSpine engagementId={e.id} current={stage ?? STATUS_STAGE[e.status]} viewing={viewing} />
    </div>
  )
}
