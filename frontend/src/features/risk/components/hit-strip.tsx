import { cn } from '@/lib/utils'

import { ASSERTIONS, type Assertion, type Hit } from '../sample-data'

const NAME: Record<Assertion, string> = {
  E: 'existence',
  C: 'completeness',
  R: 'rights',
  V: 'valuation',
  Ct: 'cut-off',
  P: 'presentation',
}

const HIT_LABEL: Record<Hit, string> = { H: 'high', M: 'medium' }

function Cell({ hit, children }: { hit?: Hit; children: string }) {
  return (
    <span
      className={cn(
        'flex size-6 items-center justify-center rounded-[5px] font-mono text-[10.5px] font-semibold',
        hit === 'H' && 'bg-vermilion text-white',
        hit === 'M' && 'bg-ochre-rule text-ochre',
        !hit && 'bg-fill text-ink-muted',
      )}
    >
      {children}
    </span>
  )
}

/**
 * Which assertions a risk hits, and how hard: red is high, ochre medium, grey not affected.
 * `only` draws a single cell with that glyph, for the fraud-risk list.
 */
export function HitStrip({
  hits,
  only,
  label,
}: {
  hits: Partial<Record<Assertion, Hit>>
  only?: string
  label: string
}) {
  if (only) {
    return (
      <span className="inline-flex shrink-0" aria-hidden="true">
        <Cell hit={only === '!' ? 'H' : undefined}>{only}</Cell>
      </span>
    )
  }
  const summary = ASSERTIONS.filter((a) => hits[a])
    .map((a) => `${NAME[a]} ${HIT_LABEL[hits[a]!]}`)
    .join(', ')
  return (
    <span className="inline-flex gap-[3px]" role="img" aria-label={`${label}: ${summary || 'no assertions hit'}`}>
      {ASSERTIONS.map((a) => (
        <Cell key={a} hit={hits[a]}>
          {a}
        </Cell>
      ))}
    </span>
  )
}

export function HitLegend() {
  return (
    <div className="text-ink-muted flex items-center gap-2.5 text-xs">
      <Cell hit="H">H</Cell>High <Cell hit="M">M</Cell>Medium <Cell>L</Cell>Low
    </div>
  )
}
