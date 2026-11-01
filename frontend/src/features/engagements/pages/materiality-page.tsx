import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chip, MaterialityRuler, Money, SampleChip, SignLine } from '@/components/tickmark'
import { BRAND } from '@/lib/brand'
import { formatAmount } from '@/lib/money'
import { cn } from '@/lib/utils'

import { useSignOff } from '../use-sign-off'
import { Sources } from '../components/source-list'
import { BENCHMARKS, PERFORMANCE_SHARES, SPECIFIC, TRIVIAL_SHARES } from '../sample-data'

const full = (n: number) => formatAmount(Math.round(n))

/** 14 · Set materiality: the benchmarks, the ruler, and the auditor's choice. */
export function MaterialityPage() {
  const [signed, sign] = useSignOff()
  const suggested = BENCHMARKS.find((b) => b.suggested)!
  const [benchmarkId, setBenchmarkId] = useState(suggested.id)
  const [performancePct, setPerformancePct] = useState<number>(75)
  const [trivialPct, setTrivialPct] = useState<number>(5)

  const benchmark = BENCHMARKS.find((b) => b.id === benchmarkId)!
  const overall = benchmark.overall
  const performance = (overall * performancePct) / 100
  const trivial = (overall * trivialPct) / 100

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-ground flex flex-1 flex-wrap items-start gap-6 px-6 py-7">
        <section className="flex min-w-0 flex-[1_1_440px] flex-col gap-3">
          <div className="mb-1.5 flex flex-col gap-1">
            <SampleChip className="self-start" />
            <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.022em]">
              How big an error would change a reader's mind?
            </h1>
            <p className="text-ink-muted">
              {BRAND} computed four benchmarks from the trial balance. Picking one is your judgment.
            </p>
          </div>
          <div role="radiogroup" aria-label="Benchmark" className="flex flex-col gap-3">
            {BENCHMARKS.map((b) => {
              const on = b.id === benchmarkId
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setBenchmarkId(b.id)}
                  className={cn(
                    'bg-sheet flex items-center gap-3.5 rounded-[10px] border px-4 py-3.5 text-left',
                    on && 'border-ink shadow-[0_0_0_1px_var(--ink)]',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-[18px] shrink-0 rounded-full',
                      on ? 'border-ink border-[5px]' : 'border-[1.5px] border-[var(--input)]',
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={on ? 'font-semibold' : 'font-medium'}>{b.label}</span>
                      {b.suggested && <Chip className="bg-link-wash text-link">{BRAND} suggests</Chip>}
                    </div>
                    <div className="text-ink-muted mt-[3px] text-xs">
                      {b.base}
                      {b.baseAmount && <span className="tnum">{b.baseAmount}</span>}
                      <Sources items={b.sources} />
                      {b.extra}
                    </div>
                  </div>
                  <span className={cn('tnum', on ? 'text-[17px] font-semibold' : 'text-base')}>{b.value}</span>
                </button>
              )
            })}
          </div>
          <p className="text-ink-muted mt-1 text-xs">
            Why PBT: Kagera is profit-driven, privately owned, and profit has been stable. Revenue would make sense if
            profit swung or the lender's covenant used sales.
          </p>
        </section>

        <Card className="min-w-0 flex-[1_1_440px] gap-[18px] p-[22px]">
          <span className="text-ink-muted text-[13px] font-semibold">The ruler for this audit</span>
          <MaterialityRuler trivial={trivial} performance={performance} overall={overall} misstatements={[]} />
          <div>
            <Level label="Overall materiality">
              <b className="tnum text-lg">{full(overall)}</b>
            </Level>
            <Level label="Performance materiality">
              <Segmented
                label="Performance share"
                options={PERFORMANCE_SHARES}
                value={performancePct}
                onChange={setPerformancePct}
              />
              <b className="tnum text-base">{full(performance)}</b>
            </Level>
            <Level label="Clearly trivial">
              <Segmented label="Trivial share" options={TRIVIAL_SHARES} value={trivialPct} onChange={setTrivialPct} />
              <b className="tnum text-base">{full(trivial)}</b>
            </Level>
            <Level label={SPECIFIC.label} last>
              <b className="tnum text-vermilion text-base">{full(SPECIFIC.amount)}</b>
            </Level>
          </div>
          <p className="bg-ground text-ink-muted rounded-lg px-3.5 py-3 text-[13px]">
            {performancePct}% performance assumes few errors last year and good controls. The prior auditor found 2
            small misstatements <Sources items={['FY25 mgmt letter p.3']} />. If testing finds more, {BRAND} will
            suggest lowering it.
          </p>
        </Card>
      </div>

      <SignLine
        sticky
        signed={signed}
        className="mt-auto"
        actions={
          <>
            <Button variant="secondary" onClick={() => sign(window.prompt('Your reason') ?? 'No reason given')}>
              Add a reason
            </Button>
            <Button
              onClick={() => sign(`Approved ${benchmark.label.toLowerCase()}, performance at ${performancePct}%`)}
            >
              Approve materiality
            </Button>
          </>
        }
      >
        {benchmark.label}, <Money amount={overall} currency="UGX" compact />, performance at {performancePct}%. Your
        reason is saved with your name.
      </SignLine>
    </div>
  )
}

function Level(props: { label: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-wrap items-baseline justify-between gap-3 py-3', !props.last && 'border-b')}>
      <span className="flex-1">{props.label}</span>
      {props.children}
    </div>
  )
}

function Segmented<T extends number>(props: {
  label: string
  options: readonly T[]
  value: number
  onChange: (v: T) => void
}) {
  return (
    <span role="group" aria-label={props.label} className="inline-flex overflow-hidden rounded-lg border">
      {props.options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={props.value === o}
          onClick={() => props.onChange(o)}
          className={cn(
            'border-r px-3 py-1.5 text-[13px] last:border-r-0',
            props.value === o ? 'bg-ink text-on-ink' : 'hover:bg-fill',
          )}
        >
          {o}%
        </button>
      ))}
    </span>
  )
}
