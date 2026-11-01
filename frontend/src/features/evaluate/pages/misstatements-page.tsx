import { useState } from 'react'
import { toast } from 'sonner'

import { SampleChip, SignLine, SourceChip, Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { EXCEPTIONS, MATERIALITY, MISSTATEMENTS, short, type Misstatement } from '../mock'

const sum = (items: Misstatement[]) => items.reduce((t, m) => t + m.amount, 0)
const pct = (n: number) => `${((n / MATERIALITY.overall) * 100).toFixed(1)}%`

/** Board 32: totals the misstatements reviewers marked right, against materiality. The partner team decides. */
export function MisstatementsPage() {
  const uncorrected = MISSTATEMENTS.filter((m) => m.status === 'uncorrected')
  const corrected = MISSTATEMENTS.filter((m) => m.status === 'corrected')
  const trivial = MISSTATEMENTS.filter((m) => m.status === 'trivial')
  const total = sum(uncorrected)
  const [decision, setDecision] = useState<{ text: string; reason: string; at: string } | null>(null)
  const decide = (text: string, reason: string) =>
    setDecision({
      text,
      reason,
      at: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    })

  return (
    <div className="flex min-h-full flex-col">
      <div className="bg-ground flex flex-1 flex-col gap-4 px-6 py-[22px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.01em]">
              Uncorrected errors add up to UGX {short(total)}: under materiality, close to the line
            </h1>
            <p className="text-ink-muted mt-1 text-sm">
              kebera totals only misstatements a reviewer marked right. Whether they are material is your judgment.
            </p>
          </div>
          <SampleChip />
        </div>

        <div className="bg-sheet rounded-card shadow-card px-[22px] pt-[18px] pb-3.5">
          <Ruler total={total} />
          <div className="border-rule-soft mt-2.5 flex flex-wrap border-t">
            <Stat label="Uncorrected" value={short(total)} tone="text-vermilion">
              {Math.round((total / MATERIALITY.performance) * 100)}% of performance
            </Stat>
            <Stat label="Corrected by management" value={short(sum(corrected))} tone="text-pine">
              {corrected.length} adjustments posted
            </Stat>
            <Stat label="Below trivial, not added" value={short(sum(trivial))}>
              {trivial.length} item
            </Stat>
            <Stat label="Exceptions judged" value={`${EXCEPTIONS.judged} of ${EXCEPTIONS.total}`} last>
              {EXCEPTIONS.right} right · {EXCEPTIONS.wrong} wrong
            </Stat>
          </div>
        </div>

        <div className="bg-sheet rounded-card shadow-card overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-ink-muted border-rule border-b text-left text-xs font-medium whitespace-nowrap">
                <th className="w-7 px-3 py-2 font-medium">
                  <span className="sr-only">Mark</span>
                </th>
                <th className="px-3 py-2 font-medium">Misstatement</th>
                <th className="px-3 py-2 font-medium">Kind</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">UGX</th>
                <th className="px-3 py-2 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {MISSTATEMENTS.map((m) => (
                <Row key={m.id} m={m} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-sheet rounded-xl border border-[#B8D6F5] px-4 py-3.5 text-[13.5px] leading-[1.55]">
          <b className="text-link font-semibold">kebera suggests</b> asking management again to correct the 24m cut-off
          error, which restores headroom to 59% of performance materiality. Separately, the related-party note must name
          Lwera Feeds and the UGX 1.84bn of purchases: that is presentation, not a number, and no total captures it.
        </div>
      </div>

      <SignLine
        sticky
        signed={decision ? { by: 'You', at: decision.at, reason: decision.reason } : undefined}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                decide('You asked management to correct the uncorrected errors.', 'asked management to correct')
                toast.success('Request sent to R. Nansubuga')
              }}
            >
              Ask management to correct
            </Button>
            <Button
              onClick={() => {
                decide(
                  `You concluded that ${short(total)} of uncorrected errors is not material.`,
                  'concluded not material',
                )
                toast.success('Conclusion recorded', { description: 'Your name, the time and the file version.' })
              }}
            >
              Conclude: not material
            </Button>
          </>
        }
      >
        {decision?.text ?? `Decide whether ${short(total)} of uncorrected errors, alone or together, is material.`}
      </SignLine>
    </div>
  )
}

/** The board's large materiality line: uncorrected total in vermilion, headroom hatched, three thresholds marked. */
function Ruler({ total }: { total: number }) {
  const at = pct(total)
  const tick = (n: number) => pct(n)
  return (
    <div
      className="relative h-[84px]"
      role="img"
      aria-label={`${short(total)} uncorrected, against trivial ${short(MATERIALITY.trivial)}, performance ${short(MATERIALITY.performance)} and overall ${short(MATERIALITY.overall)} materiality`}
    >
      <div className="absolute inset-x-0 top-[34px] h-3 rounded-md bg-[#F2F2F5]" />
      <div className="bg-vermilion absolute top-[34px] left-0 h-3 rounded-l-md" style={{ width: at }} />
      <div
        className="absolute top-[34px] right-0 h-3 rounded-r-md bg-[repeating-linear-gradient(135deg,var(--color-rule)_0_4px,var(--color-sheet)_4px_8px)]"
        style={{ left: at }}
      />
      {[MATERIALITY.trivial, MATERIALITY.performance].map((n) => (
        <div key={n} className="bg-ink absolute top-[26px] h-7 w-0.5" style={{ left: tick(n) }} />
      ))}
      <div className="bg-ink absolute top-5 right-0 h-10 w-[3px]" />
      <div
        className="text-ink-muted absolute top-1 -translate-x-1/2 text-xs"
        style={{ left: tick(MATERIALITY.trivial) }}
      >
        Trivial {short(MATERIALITY.trivial)}
      </div>
      <div
        className="text-ink-muted absolute top-1 -translate-x-1/2 text-xs"
        style={{ left: tick(MATERIALITY.performance) }}
      >
        Performance {short(MATERIALITY.performance)}
      </div>
      <div className="text-ink-muted absolute top-0 right-0 text-xs">Overall {short(MATERIALITY.overall)}</div>
      <div
        className="text-vermilion tnum absolute top-[58px] -translate-x-1/2 text-[13px] font-semibold"
        style={{ left: at }}
      >
        {short(total)} uncorrected
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
  last,
  children,
}: {
  label: string
  value: string
  tone?: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn('border-rule-soft flex min-w-[150px] flex-1 flex-col gap-0.5 px-4 py-3.5', !last && 'border-r')}>
      <span className="text-ink-muted text-xs">{label}</span>
      <b className={cn('tnum text-xl font-bold', tone)}>{value}</b>
      <span className="text-ink-muted text-xs">{children}</span>
    </div>
  )
}

const STATUS_TONE = { uncorrected: 'text-vermilion', corrected: 'text-pine', trivial: 'text-ink-muted' } as const

function Row({ m }: { m: Misstatement }) {
  const dim = m.status === 'trivial'
  return (
    <tr className="border-rule-soft border-b align-top text-[13px] last:border-b-0">
      <td className="px-3 py-2.5">
        {m.status === 'uncorrected' && <Tickmark kind="exception" confirmed />}
        {m.status === 'corrected' && <Tickmark kind="agreed" confirmed />}
        {m.status === 'trivial' && (
          <Tickmark kind="note" className="border-ink-muted text-ink-muted border-dashed" label="Not checked">
            ·
          </Tickmark>
        )}
      </td>
      <td className={cn('px-3 py-2.5', dim && 'text-ink-muted')}>
        {m.title}
        {m.detail && <div className="text-ink-muted text-xs">{m.detail}</div>}
      </td>
      <td className="px-3 py-2.5">
        <span className="text-ink-soft inline-flex h-[22px] items-center rounded-full bg-[#F2F2F5] px-2 text-[11.5px] font-medium whitespace-nowrap">
          {m.kind}
        </span>
      </td>
      <td className={cn('px-3 py-2.5', STATUS_TONE[m.status])}>{m.statusText}</td>
      <td className={cn('tnum px-3 py-2.5 text-right whitespace-nowrap', dim && 'text-ink-muted')}>
        {m.amount.toLocaleString('en-GB')}
      </td>
      <td className="px-3 py-2.5">
        <span className="flex flex-wrap gap-1">
          {m.evidence.map((e) => (
            <SourceChip key={e}>{e}</SourceChip>
          ))}
        </span>
      </td>
    </tr>
  )
}
