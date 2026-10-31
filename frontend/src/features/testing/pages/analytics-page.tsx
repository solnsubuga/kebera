import { SignLine } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

import { MarkCell } from '../components/mark'
import { SourceText } from '../components/source-text'
import { TestStage } from '../components/test-stage'
import { MODEL, MONTHLY_REVENUE, STATEMENT_LINES } from '../mock-data'

export function AnalyticsPage() {
  return (
    <TestStage
      signLine={
        <SignLine
          sticky
          label="Your call"
          actions={
            <>
              <Button variant="secondary" asChild>
                <Link to="../requests">Edit the 2 questions</Link>
              </Button>
              <Button>Accept and send questions</Button>
            </>
          }
        >
          Accept 4 explanations. The receivables jump and the margin gap become questions for management and targeted
          cut-off tests.
        </SignLine>
      }
    >
      <div className="flex flex-wrap items-start gap-5">
        <section className="flex min-w-0 flex-[3_1_600px] flex-col gap-3.5">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">What moved, and does the business explain it?</h1>
            <p className="text-ink-muted mt-1">
              {BRAND} compared the draft statements to last year and to its own expectation. Every figure is recomputed
              in code from the trial balance.
            </p>
          </div>
          <Card className="overflow-x-auto p-0">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-ink-muted border-b text-xs">
                  <th className="w-7 px-3 py-2" />
                  <th className="px-3 py-2 text-left font-medium">Line (UGX m)</th>
                  <th className="px-3 py-2 text-right font-medium">FY26</th>
                  <th className="px-3 py-2 text-right font-medium">FY25</th>
                  <th className="px-3 py-2 text-right font-medium">Change</th>
                  <th className="px-3 py-2 text-left font-medium">{BRAND}&apos;s explanation</th>
                </tr>
              </thead>
              <tbody>
                {STATEMENT_LINES.map((l) => (
                  <tr
                    key={l.line}
                    className={cn('border-b align-top last:border-b-0', l.mark === 'exception' && 'bg-vermilion-wash')}
                  >
                    <td className="px-3 py-2.5">
                      <MarkCell mark={l.mark} />
                    </td>
                    <td className={cn('px-3 py-2.5', l.mark === 'exception' && 'font-medium')}>{l.line}</td>
                    <td className="tnum px-3 py-2.5 text-right">{l.fy26}</td>
                    <td className="tnum px-3 py-2.5 text-right">{l.fy25}</td>
                    <td className="tnum px-3 py-2.5 text-right">{l.change}</td>
                    <td className="px-3 py-2.5">
                      <SourceText parts={l.explanation} />
                      {l.unexplained && <span className="font-medium">{l.unexplained}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <RevenueByMonth />
        </section>
        <ModelReview />
      </div>
    </TestStage>
  )
}

function RevenueByMonth() {
  const max = Math.max(...MONTHLY_REVENUE)
  const rest = MONTHLY_REVENUE.slice(0, -1)
  const ratio = MONTHLY_REVENUE[11] / (rest.reduce((a, b) => a + b, 0) / rest.length)
  return (
    <Card className="gap-0 px-[18px] py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <b className="font-semibold">Revenue by month, UGX m</b>
        <span className="text-ink-muted text-xs">
          June is {ratio.toFixed(1)} times the average of the other 11 months{' '}
          <SourceText parts={[{ label: 'GL 4000 by month' }]} />
        </span>
      </div>
      <div
        role="img"
        aria-label="Monthly revenue: steady near 900 million, then 2,100 million in June"
        className="border-rule-strong mt-2.5 flex h-[170px] items-end gap-1.5 border-b"
      >
        {MONTHLY_REVENUE.map((v, i) => (
          <div
            key={i}
            className={cn('flex-1 rounded-t-[3px]', i === 11 ? 'bg-vermilion' : 'bg-rule-strong')}
            style={{ height: `${(v / max) * 160}px` }}
          />
        ))}
      </div>
      <div className="text-ink-muted mt-1.5 flex justify-between text-xs">
        <span>Jul 2025</span>
        <span>Jun 2026</span>
      </div>
    </Card>
  )
}

function ModelReview() {
  return (
    <Card className="flex min-w-0 flex-[1_1_300px] flex-col gap-0 px-[18px] py-4">
      <div className="text-ink-muted text-[13px] font-semibold">Model review</div>
      <div className="flex items-center gap-2.5 border-b py-2.5">
        <span className="bg-fill rounded-full px-2 py-0.5 font-mono text-[11px] font-medium">XLSX</span>
        <div>
          <b className="font-medium">{MODEL.file}</b>
          <div className="text-ink-muted text-xs">{MODEL.meta}</div>
        </div>
      </div>
      {MODEL.findings.map((f, i) => (
        <div
          key={f.title}
          className={cn('flex gap-2.5 py-3 text-[13px] leading-normal', i < MODEL.findings.length - 1 && 'border-b')}
        >
          <MarkCell mark={f.mark} />
          <div className="min-w-0">
            <b className="font-medium">{f.title}</b>
            {f.formula && f.block ? (
              <>
                <div className="bg-fill mt-1 rounded-md px-2 py-1.5 font-mono text-[11.5px] break-all">{f.formula}</div>
                <div className="text-ink-muted mt-1 text-xs">
                  <SourceText parts={f.detail} />
                </div>
              </>
            ) : (
              <div className="text-ink-muted mt-0.5 text-xs">
                {f.formula && <span className="font-mono">{f.formula}</span>}
                <SourceText parts={f.detail} />
              </div>
            )}
          </div>
        </div>
      ))}
    </Card>
  )
}
