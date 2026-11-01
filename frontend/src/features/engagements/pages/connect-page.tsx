import { Link, useOutletContext } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SampleChip, SignLine, SourceChip, Tickmark } from '@/components/tickmark'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

import type { Engagement } from '../types'
import { useSignOff } from '../use-sign-off'
import { markKind } from '../marks'
import { engagementPath } from '../paths'
import { SOURCES, TIE_OUTS } from '../sample-data'

const agreeing = TIE_OUTS.filter((t) => t.mark !== 'exception').length

/** 12 · Connect books and tie out: the client's sources, and the checks that unlock testing. */
export function ConnectPage() {
  const e = useOutletContext<Engagement>()
  const [signed, sign] = useSignOff()
  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-ground flex flex-1 flex-wrap items-start gap-5 p-6">
        <section className="flex min-w-0 flex-[2_1_360px] flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted text-[13px] font-semibold">Sources · {SOURCES.length}</span>
            <Button variant="secondary" size="sm" disabled title="Uploads arrive with the backend">
              Add source
            </Button>
          </div>
          <Card className="gap-0 overflow-hidden p-0">
            <ul>
              {SOURCES.map((s) => (
                <li
                  key={s.name}
                  className={cn(
                    'flex items-center gap-3 border-b px-3.5 py-[11px] last:border-b-0',
                    s.mark === 'requested' && 'bg-ochre-wash',
                  )}
                >
                  <span
                    className={cn(
                      'text-ink-muted flex size-[30px] shrink-0 items-center justify-center rounded-lg font-mono text-[10.5px] font-semibold',
                      s.mark === 'requested' ? 'bg-sheet' : 'bg-ground',
                    )}
                    aria-hidden="true"
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{s.name}</div>
                    <div className={cn('text-xs', s.mark === 'requested' ? 'text-ochre' : 'text-ink-muted')}>
                      {s.detail}
                      {s.count && <span className="tnum">{s.count}</span>}
                      {s.countAfter}
                    </div>
                  </div>
                  {s.mark === 'signed-agreed' && <Tickmark kind="agreed" confirmed />}
                  {s.mark === 'query' && <Tickmark kind="query" />}
                  {s.mark === 'requested' && (
                    <Button variant="secondary" size="sm" asChild>
                      <Link to={engagementPath(e.id, 'requests')}>Chase</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <p className="text-ink-muted text-xs">
            Reads QuickBooks, Sage, Tally, Odoo, Xero and Excel exports, bank PDFs and scanned folders. Files stay in
            this engagement's vault.
          </p>
        </section>

        <section className="flex min-w-0 flex-[3_1_520px] flex-col gap-3">
          <div className="flex flex-col gap-1">
            <SampleChip className="self-start" />
            <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.022em]">
              Testing unlocks when the books tie out
            </h1>
            <p className="text-ink-muted">
              A test on books that don't reconcile proves nothing. {agreeing} of {TIE_OUTS.length} checks agree; one
              bank account is off by <span className="tnum whitespace-nowrap">UGX 3.2m</span>, and {BRAND} found why.
            </p>
          </div>
          <Card className="gap-0 overflow-x-auto p-0">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="text-ink-muted border-b text-left text-xs whitespace-nowrap">
                  <th className="w-7 px-3.5 py-2 font-medium">
                    <span className="sr-only">Mark</span>
                  </th>
                  <th className="px-3.5 py-2 font-medium">Check</th>
                  <th className="px-3.5 py-2 text-right font-medium">Books</th>
                  <th className="px-3.5 py-2 text-right font-medium">Other side</th>
                  <th className="px-3.5 py-2 text-right font-medium">Difference</th>
                </tr>
              </thead>
              <tbody>
                {TIE_OUTS.map((t) => (
                  <tr
                    key={t.check}
                    className={cn('border-b align-top last:border-b-0', t.mark === 'exception' && 'bg-vermilion-wash')}
                  >
                    <td className="px-3.5 py-2.5">
                      <Tickmark kind={markKind(t.mark)} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      {t.mark === 'exception' ? <span className="font-medium">{t.check}</span> : t.check}
                      {t.source && (
                        <>
                          {' '}
                          <SourceChip>{t.source}</SourceChip>
                        </>
                      )}
                      {t.note && (
                        <div className="text-ink-muted text-xs">
                          {t.note}
                          {t.noteAmount && <span className="tnum whitespace-nowrap">{t.noteAmount}</span>}
                          {t.noteAfter}
                        </div>
                      )}
                      {t.items && (
                        <div className="bg-sheet mt-2 flex flex-col gap-1.5 rounded-lg border px-3 py-2.5">
                          <div className="text-link text-[12.5px] font-medium">
                            {BRAND} found {t.items.length} reconciling items that explain all of it
                          </div>
                          {t.items.map((i) => (
                            <div key={i.text} className="flex justify-between gap-3 text-[13px]">
                              <span>
                                {i.text} <SourceChip>{i.source}</SourceChip>
                              </span>
                              <span className="tnum">{i.amount}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="tnum px-3.5 py-2.5 text-right whitespace-nowrap">{t.books}</td>
                    <td className="tnum px-3.5 py-2.5 text-right whitespace-nowrap">{t.other}</td>
                    <td
                      className={cn(
                        'tnum px-3.5 py-2.5 text-right whitespace-nowrap',
                        t.diffTone === 'agreed' && 'text-pine',
                        t.diffTone === 'exception' && 'text-vermilion',
                      )}
                    >
                      {t.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="text-ink-muted text-xs">
            All figures in UGX · recomputed in code from the source files, not by the model ·{' '}
            <SourceChip>run r-0391</SourceChip>
          </p>
        </section>
      </div>

      <SignLine
        sticky
        signed={signed}
        className="mt-auto"
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to={engagementPath(e.id, 'requests')}>Ask the client</Link>
            </Button>
            <Button onClick={() => sign('Approved the tie-out; the two Centenary items are logged for follow-up')}>
              Approve tie-out
            </Button>
          </>
        }
      >
        Accept the two Centenary items as reconciling and log them for follow-up, then testing unlocks.
      </SignLine>
    </div>
  )
}
