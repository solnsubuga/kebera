import { formatShort } from '@/lib/money'
import { cn } from '@/lib/utils'

export type RulerMark = { amount: number; label: string }

type MaterialityRulerProps = {
  /** Clearly trivial threshold: errors below it are ignored. */
  trivial: number
  performance: number
  overall: number
  /** Misstatements found so far; each lands as a dot. */
  misstatements?: RulerMark[]
  currency?: string
  className?: string
}

/** Trivial, performance and overall materiality on one line, with misstatements landing on it. */
export function MaterialityRuler({
  trivial,
  performance,
  overall,
  misstatements = [],
  currency = 'UGX',
  className,
}: MaterialityRulerProps) {
  const top = Math.max(overall, ...misstatements.map((m) => m.amount * 1.04))
  const at = (v: number) => `${Math.min(100, Math.max(0, (v / top) * 100))}%`
  const summary =
    `Materiality ruler in ${currency}: trivial ${formatShort(trivial)}, performance ${formatShort(performance)}, ` +
    `overall ${formatShort(overall)}.` +
    misstatements.map((m) => ` ${m.label}: ${formatShort(m.amount)}.`).join('')
  const ticks = [
    { v: trivial, key: 'trivial' },
    { v: performance, key: 'performance' },
    { v: overall, key: 'overall' },
  ]

  return (
    <div role="img" aria-label={summary} className={cn('relative h-[50px] select-none', className)}>
      <div
        className="absolute inset-x-0 top-5 h-1.5 rounded-full"
        style={{
          background: `linear-gradient(90deg, var(--pine-wash) 0 ${at(trivial)}, var(--fill) ${at(trivial)} ${at(performance)}, var(--vermilion-wash) ${at(performance)} 100%)`,
        }}
      />
      {ticks.map(({ v, key }) => (
        <div
          key={key}
          className={cn(
            'bg-ink absolute -translate-x-1/2',
            key === 'overall' ? 'top-2 h-[30px] w-0.5' : 'top-3 h-[22px] w-[1.5px]',
          )}
          style={{ left: at(v) }}
        />
      ))}
      {misstatements.map((m) => (
        <div
          key={m.label}
          title={`${m.label}: ${currency} ${formatShort(m.amount)}`}
          className={cn(
            'border-sheet absolute top-[17px] size-3 -translate-x-1/2 rounded-full border-2',
            m.amount >= performance ? 'bg-vermilion' : 'bg-ink',
          )}
          style={{ left: at(m.amount) }}
        />
      ))}
      {ticks.map(({ v, key }) => (
        <div
          key={`${key}-label`}
          className={cn(
            'tnum text-ink-muted absolute top-[38px] text-[10.5px]',
            key === 'trivial'
              ? 'translate-x-0'
              : key === 'overall' && v >= top
                ? '-translate-x-full'
                : '-translate-x-1/2',
          )}
          style={{ left: key === 'trivial' ? 0 : at(v) }}
        >
          {formatShort(v)}
        </div>
      ))}
    </div>
  )
}
