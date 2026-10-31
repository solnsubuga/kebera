import { cn } from '@/lib/utils'

import { ASSERTIONS, type AssertionKey, type AssertionState } from './assertions'

const STATE_LABEL = { covered: 'covered by a signed test', planned: 'test planned', none: 'not covered' }

export function AssertionStrip({
  value,
  className,
}: {
  value: Partial<Record<AssertionKey, AssertionState>>
  className?: string
}) {
  return (
    <span
      role="list"
      aria-label="Assertions"
      className={cn('border-rule-strong inline-flex overflow-hidden rounded-md border', className)}
    >
      {ASSERTIONS.map(({ key, name }) => {
        const state = value[key] ?? 'none'
        return (
          <span
            key={key}
            role="listitem"
            title={`${name}: ${STATE_LABEL[state]}`}
            aria-label={`${name}: ${STATE_LABEL[state]}`}
            className={cn(
              'border-rule-strong flex h-6 w-[26px] items-center justify-center border-r font-mono text-[11px] last:border-r-0',
              state === 'covered' && 'bg-pine text-white',
              state === 'planned' && 'bg-link-wash text-link',
              state === 'none' && 'text-ink-muted',
            )}
          >
            {key}
          </span>
        )
      })}
    </span>
  )
}

/** An account name beside its strip, as in the risk table. */
export function AssertionRow({
  label,
  value,
}: {
  label: string
  value: Partial<Record<AssertionKey, AssertionState>>
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[13px]">{label}</span>
      <AssertionStrip value={value} />
    </div>
  )
}
