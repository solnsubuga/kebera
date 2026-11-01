import { Link } from 'react-router'

import { cn } from '@/lib/utils'

import { STAGES, stageIndex, type StageKey } from './stages'

type StageSpineProps = {
  engagementId: string
  /** The stage the audit has reached. Stages before it show as done. */
  current: StageKey
  /** The stage on screen, underlined. */
  viewing?: StageKey
  className?: string
}

/** The eight-stage spine under every engagement header. */
export function StageSpine({ engagementId, current, viewing, className }: StageSpineProps) {
  const at = stageIndex(current)
  return (
    <nav
      aria-label="Audit stages"
      className={cn('border-rule-soft flex items-center overflow-x-auto border-b px-4', className)}
    >
      <ol className="flex items-center">
        {STAGES.map((stage, i) => {
          const state = i < at ? 'done' : i === at ? 'current' : 'upcoming'
          const isViewing = stage.key === viewing
          return (
            <li key={stage.key} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className="bg-rule-strong h-px w-3 shrink-0" />}
              <Link
                to={`/engagements/${engagementId}/${stage.path}`}
                aria-current={isViewing ? 'page' : undefined}
                data-state={state}
                className={cn(
                  'text-ink-soft hover:text-ink flex items-center gap-2 border-b-2 border-transparent px-2.5 py-[11px] text-[13px] whitespace-nowrap',
                  isViewing && 'border-link text-ink font-semibold',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-flex size-[18px] items-center justify-center rounded-full font-mono text-[10px] font-semibold',
                    state === 'done' && 'bg-pine text-white',
                    state === 'current' && 'text-ink shadow-[inset_0_0_0_1.5px_var(--ink)]',
                    state === 'upcoming' && 'text-ink-muted shadow-[inset_0_0_0_1.5px_var(--rule-strong)]',
                  )}
                >
                  {state === 'done' ? '✓' : i + 1}
                </span>
                {stage.label}
                <span className="sr-only">
                  {state === 'done' ? ' (done)' : state === 'current' ? ' (in progress)' : ''}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
