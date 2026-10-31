import { Link } from 'react-router'

import { SignLine, SourceChip } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

import { TestStage } from '../components/test-stage'
import { BENFORD, TEST_RUN, TESTS, type PopulationTest } from '../mock-data'

const count = new Intl.NumberFormat('en-GB')

export function TestsPage() {
  const exceptions = TESTS.filter((t) => !t.signal).reduce((n, t) => n + t.found, 0)
  const signals = TESTS.filter((t) => t.signal).length
  return (
    <TestStage
      signLine={
        <SignLine
          sticky
          label="Next"
          actions={
            <Button asChild>
              <Link to="../exceptions">Start triage</Link>
            </Button>
          }
        >
          {exceptions} exceptions wait for your judgment. Nothing here is a finding until you mark it.
        </SignLine>
      }
    >
      <div className="flex flex-wrap items-start gap-5">
        <section className="flex min-w-0 flex-[3_1_620px] flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">Every transaction tested, not a sample of 25</h1>
              <p className="text-ink-muted mt-1">
                {TESTS.length} tests from the plan ran on the whole ledger last night. {exceptions} exceptions,{' '}
                {signals} signals for the risk score.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Add test</Button>
              <Button variant="secondary">Rerun all</Button>
            </div>
          </div>
          <Card className="overflow-x-auto p-0">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-ink-muted border-b text-xs whitespace-nowrap">
                  <th className="px-3 py-2 text-left font-medium">Test</th>
                  <th className="px-3 py-2 text-left font-medium">Assertion</th>
                  <th className="px-3 py-2 text-right font-medium">Tested</th>
                  <th className="px-3 py-2 text-right font-medium">Found</th>
                  <th className="px-3 py-2 text-right font-medium">Value (UGX)</th>
                  <th className="px-3 py-2 text-left font-medium">Measured catch rate</th>
                </tr>
              </thead>
              <tbody>
                {TESTS.map((t) => (
                  <tr key={t.name} className="h-11 border-b whitespace-nowrap last:border-b-0">
                    <td className="px-3">
                      <b className="font-medium">{t.name}</b>
                      {t.note && <span className="text-ink-muted text-xs"> {t.note}</span>}
                    </td>
                    <td className="px-3">{t.assertion}</td>
                    <td className="tnum px-3 text-right">{count.format(t.tested)}</td>
                    <td className="px-3 text-right">
                      <FoundPill test={t} />
                    </td>
                    <td className="tnum px-3 text-right">{t.value ?? '–'}</td>
                    <td className="text-ink-muted px-3 text-xs">{t.catchRate ?? 'Feeds the risk score only'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="text-ink-muted text-xs leading-relaxed">
            Catch rates come from {BRAND}&apos;s test books with planted errors. See{' '}
            <Link to="/trust" className="text-link">
              Trust
            </Link>
            . All tests ran in code on ledger <SourceChip>{TEST_RUN.ledger}</SourceChip> ·{' '}
            <SourceChip>{TEST_RUN.run}</SourceChip>
          </div>
        </section>
        <BenfordCard />
      </div>
    </TestStage>
  )
}

function FoundPill({ test }: { test: PopulationTest }) {
  const tone = test.signal
    ? 'bg-link-wash text-link'
    : test.found
      ? 'bg-vermilion-wash text-vermilion'
      : 'bg-pine-wash text-pine'
  return (
    <span
      className={cn(
        'tnum inline-flex h-[22px] min-w-[26px] items-center justify-center rounded-full px-[7px] text-xs font-semibold',
        tone,
      )}
    >
      {test.found}
    </span>
  )
}

function BenfordCard() {
  const { expected, actual, outlier, invoices } = BENFORD
  const scale = 150 / Math.max(...expected, ...actual)
  const gap = (actual[outlier - 1] - expected[outlier - 1]).toFixed(1)
  return (
    <Card className="flex min-w-0 flex-[1_1_320px] flex-col gap-3 px-[18px] py-4">
      <div className="flex items-center justify-between">
        <span className="text-ink-muted text-[13px] font-semibold">Benford, first digit</span>
        <span className="text-ink-muted text-xs">{count.format(invoices)} invoices</span>
      </div>
      <div
        role="img"
        aria-label={`First-digit shares: close to Benford's expected curve except digit ${outlier}, which is ${gap} points high`}
        className="border-rule-strong flex h-[170px] items-end gap-2.5 border-b px-1"
      >
        {expected.map((e, i) => (
          <div key={i} className="flex h-full flex-1 items-end gap-0.5">
            <i
              className="block flex-1 rounded-t-[2px] shadow-[inset_0_0_0_1.5px_var(--color-ink-muted)]"
              style={{ height: e * scale }}
            />
            <i
              className={cn('block flex-1 rounded-t-[2px]', i === outlier - 1 ? 'bg-vermilion' : 'bg-link')}
              style={{ height: actual[i] * scale }}
            />
          </div>
        ))}
      </div>
      <div className="text-ink-muted flex justify-between px-2 text-xs">
        {expected.map((_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <div className="text-ink-muted flex gap-3.5 text-xs">
        <span className="flex items-center gap-1">
          <i className="inline-block size-2.5 shadow-[inset_0_0_0_1.5px_var(--color-ink-muted)]" /> Expected
        </span>
        <span className="flex items-center gap-1">
          <i className="bg-link inline-block size-2.5" /> Kagera
        </span>
      </div>
      <p className="text-[13.5px] leading-relaxed">
        Digit {outlier} is <b className="font-semibold">{gap} points high</b>. {BRAND} traced it: 31 invoices fall
        between <span className="tnum">45m</span> and <span className="tnum">49.9m</span>, just under the{' '}
        <span className="tnum">50m</span> board limit <SourceChip>Finance policy v4 p.3</SourceChip>.
      </p>
      <div className="bg-fill text-ink-muted rounded-lg px-3 py-2.5 text-[12.5px]">
        On its own, Benford is a weak signal. {BRAND} adds it to the risk score and lists the 31 invoices for a look; it
        never raises it as an exception by itself.
      </div>
      <Button variant="secondary">Look at the 31 invoices</Button>
    </Card>
  )
}
