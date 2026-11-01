import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EngagementHeader } from '@/components/layout/engagement-header'
import { SampleChip, SourceChip, Tickmark } from '@/components/tickmark'
import { BRAND } from '@/lib/brand'

import { RunPlan } from '../components/run-plan'
import { SAMPLE_ENGAGEMENT, SAMPLE_RUN } from '../sample-data'

const ugx = new Intl.NumberFormat('en-GB')

/** Ask: a request becomes a run with a plan, steps and a receipt. Sample run until the agent has a backend. */
export function AskPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(params.get('q') ?? SAMPLE_RUN.question)
  const [stopped, setStopped] = useState(false)
  const run = SAMPLE_RUN
  const more = run.totalFindings - run.findings.length

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setStopped(false)
    navigate(`/ask/${run.receipt[0].value}?q=${encodeURIComponent(question.trim())}`)
  }

  return (
    <>
      <EngagementHeader engagement={SAMPLE_ENGAGEMENT} viewing="test" actions={<SampleChip />} />

      <div className="bg-ground px-6 pt-5">
        <form
          onSubmit={submit}
          className="border-link bg-card ring-link-wash flex items-center gap-3 rounded-xl border px-4 py-3.5 ring-[3px]"
        >
          <Search className="text-link size-[18px] shrink-0" aria-hidden="true" />
          <label htmlFor="askq" className="sr-only">
            Ask {BRAND}
          </label>
          <input
            id="askq"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          <span className="text-ink-muted hidden text-xs sm:inline">{run.scope}</span>
        </form>
      </div>

      <div className="bg-ground flex flex-1 flex-wrap items-start gap-5 px-6 pt-4 pb-6">
        {/* Narrower screens stack the receipt under the plan; wide ones give it its own column, as on the board. */}
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-5 xl:max-w-[320px] 2xl:contents">
          <RunPlan steps={run.steps} stopped={stopped} onStop={() => setStopped(true)} />
          <Card className="flex min-w-0 flex-col gap-0 px-[18px] py-4 2xl:order-1 2xl:max-w-[280px] 2xl:flex-[1_1_220px]">
            <h2 className="text-ink-muted pb-1.5 text-[13px] font-semibold">Receipt</h2>
            <dl aria-label="Run receipt">
              {run.receipt.map((r) => (
                <div
                  key={r.label}
                  className="border-rule-soft flex justify-between gap-3 border-b py-[7px] text-[12.5px] last:border-b-0"
                >
                  <dt className="text-ink-muted">{r.label}</dt>
                  <dd className={r.code ? 'font-mono' : r.figure ? 'tnum' : undefined}>{r.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-ink-muted mt-2.5 text-xs">{run.receiptNote}</p>
            <Button variant="secondary" className="mt-3 w-full">
              Save as a reusable test
            </Button>
          </Card>
        </div>

        <section className="flex min-w-0 flex-[3_1_520px] flex-col gap-3">
          <Card className="flex flex-col gap-0 gap-2 px-[18px] py-4">
            <h2 className="text-link text-[13px] font-semibold">Answer so far</h2>
            <p className="text-[15.5px] leading-[1.55]">
              <b className="font-semibold">201 of 214 payments</b> to Lwera Feeds match an invoice and a goods received
              note. <b className="text-vermilion font-semibold">8 payments, UGX 312.4m, have no goods received note.</b>{' '}
              5 more have a note for fewer bags than invoiced. All {run.totalFindings} are added to your exception
              queue.
            </p>
          </Card>

          <Card className="gap-0 overflow-x-auto p-0">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-ink-muted border-rule border-b text-left text-xs whitespace-nowrap">
                  <th className="w-7 px-3 py-2">
                    <span className="sr-only">Mark</span>
                  </th>
                  <th className="px-3 py-2 font-medium">Payment</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 text-right font-medium">Amount (UGX)</th>
                  <th className="px-3 py-2 font-medium">What {BRAND} found</th>
                  <th className="px-3 py-2 font-medium">Sources</th>
                </tr>
              </thead>
              <tbody>
                {run.findings.map((f) => (
                  <tr key={f.payment} className="border-rule-soft border-b align-top">
                    <td className="px-3 py-2.5">
                      <Tickmark kind="exception" size="sm" />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap">{f.payment}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{f.date}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">{ugx.format(f.amountUgx)}</td>
                    <td className="px-3 py-2.5">{f.found}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex flex-col items-start gap-1">
                        {f.sources.map((s) => (
                          <SourceChip key={s}>{s}</SourceChip>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="text-ink-muted px-3 py-2.5 text-center text-xs">
                    {more} more ·{' '}
                    <Link
                      to={`/engagements/${SAMPLE_ENGAGEMENT.id}/test/exceptions`}
                      className="text-link hover:underline"
                    >
                      open all {run.totalFindings} in the exception queue
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>
      </div>
    </>
  )
}
