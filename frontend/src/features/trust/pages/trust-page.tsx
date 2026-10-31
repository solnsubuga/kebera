import { toast } from 'sonner'

import { Chip, SampleChip, SourceChip, Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ACCURACY, CLIENT_DATA, SUMMARY, TRAIL, type TestAccuracy, type TrailEvent } from '../mock'

/** Board 35: the auditor's evaluation of kebera as a tool, its trail of runs and decisions, and where client data lives. */
export function TrustPage() {
  return (
    <div className="bg-ground flex min-h-full flex-col">
      <header className="bg-sheet border-rule flex flex-wrap items-end justify-between gap-4 border-b px-7 pt-[22px] pb-1.5">
        <div className="flex flex-col gap-1 pb-3.5">
          <h1 className="text-2xl font-semibold tracking-[-0.015em]">Can we rely on kebera?</h1>
          <span className="text-ink-muted text-sm">
            ISA asks the auditor to evaluate any tool they rely on. This page is that evaluation, kept current.
          </span>
        </div>
        <div className="flex gap-2 pb-3.5">
          <SampleChip />
          <Chip>All engagements</Chip>
          <Button
            variant="secondary"
            onClick={() => toast.success('Export started', { description: 'A PDF for file review.' })}
          >
            Export for file review
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] gap-[18px] px-7 py-5">
        <section aria-labelledby="accuracy" className="bg-sheet rounded-card shadow-card col-span-full overflow-hidden">
          <div className="border-rule flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3.5">
            <div>
              <h2 id="accuracy" className="font-semibold">
                Measured accuracy, per test
              </h2>
              <div className="text-ink-muted text-xs">
                On {SUMMARY.ledgers} test ledgers with {SUMMARY.planted.toLocaleString('en-GB')} planted errors, and on
                what reviewers decided in real files
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-ink-muted text-xs">Reviewers agreed with kebera</div>
                <b className="tnum text-xl font-bold">{SUMMARY.agreedPct}%</b>{' '}
                <span className="text-ink-muted text-xs">of {SUMMARY.exceptions} exceptions</span>
              </div>
              <div>
                <div className="text-ink-muted text-xs">Errors planted and missed</div>
                <b className="tnum text-xl font-bold">{SUMMARY.missed}</b>{' '}
                <span className="text-ink-muted text-xs">of {SUMMARY.planted.toLocaleString('en-GB')}</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-ink-muted border-rule border-b text-left text-xs whitespace-nowrap">
                  <th className="px-3 py-2 font-medium">Test</th>
                  <th className="px-3 py-2 font-medium">Catches planted errors</th>
                  <th className="px-3 py-2 text-right font-medium">False alarms per 1,000</th>
                  <th className="px-3 py-2 text-right font-medium">Reviewers agreed</th>
                  <th className="px-3 py-2 font-medium">Last measured</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ACCURACY.map((t) => (
                  <AccuracyRow key={t.test} t={t} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="trail" className="bg-sheet rounded-card shadow-card px-4 py-3.5">
          <div className="mb-1 flex items-center justify-between">
            <h2 id="trail" className="font-semibold">
              Trail · {TRAIL.client}
            </h2>
            <span className="text-ink-muted text-xs">{TRAIL.total} events</span>
          </div>
          <ol>
            {TRAIL.events.map((e) => (
              <TrailRow key={e.at + e.text} e={e} />
            ))}
          </ol>
          <p className="text-ink-muted mt-1.5 text-xs">
            Any run can be replayed and gives the same result. Solid marks are people; hollow are kebera.
          </p>
        </section>

        <section aria-labelledby="client-data" className="bg-sheet rounded-card shadow-card px-4 py-3.5">
          <h2 id="client-data" className="font-semibold">
            Client data
          </h2>
          <dl>
            {CLIENT_DATA.map((d) => (
              <div
                key={d.label}
                className="border-rule-soft flex justify-between gap-4 border-b py-2.5 text-[13px] last:border-b-0"
              >
                <dt className="text-ink-muted">{d.label}</dt>
                <dd className="flex items-center gap-1.5 text-right">
                  {d.consent && <Tickmark kind="agreed" confirmed size="sm" />}
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}

function AccuracyRow({ t }: { t: TestAccuracy }) {
  const rely = t.status === 'rely'
  return (
    <tr className="border-rule-soft h-[42px] border-b text-[13px] whitespace-nowrap last:border-b-0">
      <td className="px-3 font-medium">{t.test}</td>
      <td className="px-3">
        <span
          className="bg-fill mr-2 inline-block h-1.5 w-20 overflow-hidden rounded-[3px] align-middle"
          aria-hidden="true"
        >
          <i
            className={cn('block h-1.5', t.catches < 90 ? 'bg-ochre' : 'bg-pine')}
            style={{ width: `${t.catches}%` }}
          />
        </span>
        <span className="tnum">{t.catches}%</span>
      </td>
      <td className="tnum px-3 text-right">{t.falseAlarmsPer1000.toFixed(1)}</td>
      <td className="tnum px-3 text-right">{t.reviewersAgreed}%</td>
      <td className="px-3">{t.measured}</td>
      <td className="px-3">
        <Chip className={rely ? 'text-pine' : undefined} tone={rely ? 'neutral' : 'client'}>
          {rely ? 'Rely' : 'Use with review'}
        </Chip>
      </td>
    </tr>
  )
}

const MARK = {
  signed: <Tickmark kind="signed" confirmed />,
  exception: <Tickmark kind="exception" confirmed />,
  agreed: <Tickmark kind="agreed" confirmed />,
  run: (
    <Tickmark kind="note" className="border-link text-link" label="kebera run">
      r
    </Tickmark>
  ),
}

function TrailRow({ e }: { e: TrailEvent }) {
  return (
    <li className="border-rule-soft flex gap-3 border-b py-2.5 text-[13px] leading-[1.45] last:border-b-0">
      <span className="text-ink-muted w-[88px] shrink-0 text-xs">{e.at}</span>
      {MARK[e.mark]}
      <span>
        {e.text}
        {e.sha && (
          <>
            {' '}
            <span className="font-mono text-[11.5px]">{e.sha}</span>
          </>
        )}
        {e.tail}
        {e.source && (
          <>
            {' '}
            <SourceChip>{e.source}</SourceChip>
          </>
        )}
      </span>
    </li>
  )
}
