import { useState } from 'react'
import { toast } from 'sonner'

import { SignLine, SourceChip, Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

import { TestStage } from '../components/test-stage'
import { WORKPAPER_C3 as wp, WORKPAPERS, type PaperState } from '../mock-data'

function PaperMark({ state }: { state: PaperState }) {
  if (state === 'signed') return <Tickmark kind="signed" confirmed />
  if (state === 'reviewed') return <Tickmark kind="agreed" confirmed />
  if (state === 'drafted') return <Tickmark kind="agreed" />
  return <EmptyMark />
}

/** Not started: a dashed grey circle, nothing drafted yet. */
function EmptyMark() {
  return (
    <span
      aria-label="Not started"
      className="text-ink-muted border-ink-muted inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed font-mono text-[11px]"
    >
      ·
    </span>
  )
}

const RESULT_TONE = { plain: '', exception: 'text-vermilion', client: 'text-ochre' } as const

export function WorkpapersPage() {
  const [reviewed, setReviewed] = useState(false)
  const selected = 'C-3'

  return (
    <TestStage
      signLine={
        <SignLine
          sticky
          label="Your call"
          actions={
            <>
              <Button variant="secondary" disabled={reviewed}>
                Send back with notes
              </Button>
              <Button
                disabled={reviewed}
                onClick={() => {
                  setReviewed(true)
                  toast(`${wp.code} signed as reviewer`)
                }}
              >
                {reviewed ? 'Signed as reviewer' : 'Sign as reviewer'}
              </Button>
            </>
          }
        >
          Reviewing signs this paper as yours. Every figure in it is linked; {wp.sources.checked} of {wp.sources.total}{' '}
          sources were re-opened and checked.
        </SignLine>
      }
    >
      <div className="flex flex-wrap gap-7">
        <nav aria-label="Workpapers" className="flex min-w-[200px] flex-[0_1_220px] flex-col gap-0.5">
          <div className="text-ink-muted px-2.5 pb-1.5 text-[13px] font-semibold">Working papers</div>
          {WORKPAPERS.map((p) => {
            const on = p.code === selected
            const state = on && reviewed ? 'reviewed' : p.state
            return (
              <div
                key={p.code}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]',
                  on && 'bg-sheet font-medium shadow-[0_0_0_1px_var(--color-border)]',
                )}
              >
                <PaperMark state={state} />
                {p.code} · {p.title}
              </div>
            )
          })}
          <div className="text-ink-muted px-2.5 pt-3 text-xs leading-relaxed">
            Hollow: drafted by {BRAND}
            <br />
            Solid green: reviewed
            <br />
            Black S: partner signed
          </div>
        </nav>

        <article className="bg-sheet max-w-[720px] min-w-0 flex-[1_1_560px] rounded-xl border px-6 py-7 font-serif text-[16.5px] leading-[1.65] sm:px-11 sm:py-9">
          <div className="text-ink-muted mb-1.5 flex flex-wrap items-center gap-2 font-sans text-xs">
            <span className="font-mono">{wp.code}</span>· Drafted by {BRAND} from <SourceChip>{wp.run}</SourceChip> and{' '}
            {wp.judged} judged exceptions
          </div>
          <h1 className="mb-[18px] text-[32px] leading-tight font-medium">{wp.title}</h1>
          <H2>Objective</H2>
          <P>{wp.objective}</P>
          <H2>What we did</H2>
          <P>
            We matched all 214 payments to Lwera Feeds in the year, totalling{' '}
            <span className="tnum font-sans">UGX 1,840,600,000</span> <SourceChip>GL 5120</SourceChip>, to supplier
            invoices and to the store&apos;s goods received notes. No sampling was used.
          </P>
          <H2>What we found</H2>
          <div className="border-link/30 mt-1 mb-3.5 overflow-hidden rounded-[10px] border font-sans text-[12.5px]">
            <div className="bg-link-wash text-link flex justify-between px-2.5 py-[7px] text-[11.5px]">
              <span>Live from judged exceptions</span>
              <span>updates if a judgment changes</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-ink-muted border-b text-[11.5px]">
                  <th className="px-2.5 py-[7px] text-left font-medium">Result</th>
                  <th className="px-2.5 py-[7px] text-right font-medium">Payments</th>
                  <th className="px-2.5 py-[7px] text-right font-medium">UGX</th>
                </tr>
              </thead>
              <tbody>
                {wp.results.map((r) => (
                  <tr key={r.result} className="border-b last:border-b-0">
                    <td className={cn('px-2.5 py-[7px]', RESULT_TONE[r.tone])}>{r.result}</td>
                    <td className="tnum px-2.5 py-[7px] text-right">{r.payments}</td>
                    <td className="tnum px-2.5 py-[7px] text-right">{r.ugx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>
            Of the 8 payments without a note, 6 were approved by the General Manager alone although each exceeded the{' '}
            <span className="tnum font-sans">50m</span> limit that requires a board resolution{' '}
            <SourceChip>Finance policy v4 p.3</SourceChip>.
          </P>
          <H2>
            Conclusion <span className="text-ink-muted text-xs font-normal">· draft, for the reviewer</span>
          </H2>
          <p className="bg-fill/40 rounded-lg border border-dashed px-3 py-2.5">
            Existence of <span className="tnum font-sans">UGX 312.4m</span> of feed purchases is not supported. We
            propose treating it as a factual misstatement pending management&apos;s evidence, and reporting the approval
            breaches to those charged with governance.
          </p>
          <ol className="mt-5 overflow-hidden rounded-[10px] border font-sans text-[13px]">
            {wp.signoffs.map((s, i) => {
              const done = s.state === 'done' || (i === 1 && reviewed)
              return (
                <li key={s.who} className="flex items-center gap-3 border-b px-3.5 py-3 last:border-b-0">
                  {i === 0 ? <Tickmark kind="agreed" /> : done ? <Tickmark kind="agreed" confirmed /> : <EmptyMark />}
                  <span className="flex-1">{s.who}</span>
                  <span className="text-ink-muted text-xs">{i === 1 && reviewed ? 'Just now' : s.when}</span>
                </li>
              )
            })}
          </ol>
        </article>

        <aside className="flex min-w-[220px] flex-[0_1_250px] flex-col gap-3 xl:pt-[420px]" aria-label="Comments">
          {wp.comments.map((c) => {
            const laba = c.who === BRAND
            return (
              <div
                key={c.who}
                className={cn(
                  'bg-sheet flex flex-col gap-1.5 rounded-[10px] border p-3 text-[13px]',
                  laba && 'border-link/30',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex size-[22px] items-center justify-center rounded-full text-[10px] font-semibold text-white',
                      laba ? 'bg-link' : 'bg-ink',
                    )}
                  >
                    {c.initials}
                  </span>
                  <b className={cn('font-medium', laba && 'text-link')}>{c.who}</b>
                  <span className="text-ink-muted text-xs">{c.role}</span>
                </div>
                <div>
                  {c.text} {'source' in c && c.source && <SourceChip>{c.source}</SourceChip>}
                </div>
              </div>
            )
          })}
        </aside>
      </div>
    </TestStage>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 mb-2 font-sans text-[15px] font-semibold">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3">{children}</p>
}
