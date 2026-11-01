import { useState } from 'react'
import { Link, useOutletContext } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SampleChip, SignLine, SourceChip, Tickmark } from '@/components/tickmark'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

import type { Engagement } from '../types'
import { useSignOff } from '../use-sign-off'
import { Sources } from '../components/source-list'
import { markKind } from '../marks'
import { engagementPath } from '../paths'
import { APPROVAL_TIERS, CONTROL_AREAS, GOVERNANCE } from '../sample-data'

const FILES = CONTROL_AREAS.reduce((n, a) => n + a.files, 0)
const AREAS = CONTROL_AREAS.filter((a) => a.covered !== null).length
const MISSING = 6

/** 13 · Folder and compliance review: the client's folder sorted by control, with what is missing. */
export function UnderstandPage() {
  const e = useOutletContext<Engagement>()
  const [signed, sign] = useSignOff()
  const [area, setArea] = useState('Governance')

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-ground flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <SampleChip className="self-start" />
            <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.022em]">
              {BRAND} sorted {FILES.toLocaleString('en-GB')} files into {AREAS} control areas. {MISSING} documents are
              missing.
            </h1>
            <p className="text-ink-muted">
              From the client's shared folder: PDFs, phone scans and spreadsheets. Each file is filed once, with the
              reason it was filed there.
            </p>
          </div>
          <span className="tnum text-ink-muted text-xs">
            run r-0394 · {FILES.toLocaleString('en-GB')} files · 37 read with OCR
          </span>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <nav aria-label="Control areas" className="flex min-w-[220px] flex-[0_1_250px] flex-col gap-0.5">
            <div className="text-ink-muted px-3 pb-2 text-[13px] font-semibold">Control areas</div>
            {CONTROL_AREAS.map((a) => (
              <button
                key={a.name}
                type="button"
                aria-current={area === a.name ? 'true' : undefined}
                onClick={() => setArea(a.name)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-[9px] text-left text-[13.5px]',
                  area === a.name ? 'bg-sheet font-medium shadow-[0_0_0_1px_var(--rule)]' : 'hover:bg-sheet/60',
                  a.covered === null && 'text-ink-muted',
                )}
              >
                <span className="flex-1">{a.name}</span>
                {a.covered !== null && (
                  <span className="bg-rule h-[5px] w-11 shrink-0 overflow-hidden rounded-[3px]" aria-hidden="true">
                    <i
                      className={cn('block h-[5px]', a.short ? 'bg-vermilion' : 'bg-pine')}
                      style={{ width: `${a.covered}%` }}
                    />
                  </span>
                )}
                <span className="tnum text-ink-muted text-xs">{a.files}</span>
              </button>
            ))}
          </nav>

          <Card className="min-w-0 flex-[3_1_460px] gap-0 overflow-hidden p-0">
            <div className="flex items-center justify-between gap-3 border-b px-3.5 py-3">
              <span className="font-semibold">{area}</span>
              <span className="text-ink-muted text-xs">What an auditor expects to find, and what {BRAND} found</span>
            </div>
            {area === 'Governance' ? (
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="text-ink-muted border-b text-left text-xs whitespace-nowrap">
                    <th className="w-7 px-3.5 py-2 font-medium">
                      <span className="sr-only">Mark</span>
                    </th>
                    <th className="px-3.5 py-2 font-medium">Expected</th>
                    <th className="px-3.5 py-2 font-medium">Found</th>
                  </tr>
                </thead>
                <tbody>
                  {GOVERNANCE.map((g) => (
                    <tr
                      key={g.expected}
                      className={cn(
                        'border-b align-top last:border-b-0',
                        g.tone === 'exception' && 'bg-vermilion-wash',
                      )}
                    >
                      <td className="px-3.5 py-2.5">
                        <Tickmark kind={markKind(g.mark)} />
                      </td>
                      <td className={cn('px-3.5 py-2.5', g.tone === 'exception' && 'font-medium')}>{g.expected}</td>
                      <td
                        className={cn(
                          'px-3.5 py-2.5',
                          g.tone === 'exception' && 'text-vermilion',
                          g.tone === 'client' && 'text-ochre',
                        )}
                      >
                        {g.found}
                        {g.amount && <span className="tnum whitespace-nowrap">{g.amount}</span>}
                        {g.foundAfter}
                        {g.sources.map((s) => (
                          <SourceChip key={s}>{s}</SourceChip>
                        ))}
                        {g.ellipsis && ' …'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-ink-muted px-3.5 py-6 text-[13.5px]">
                {BRAND} has filed {CONTROL_AREAS.find((a) => a.name === area)?.files} files here. Open Governance to see
                the expected-and-found review.
              </p>
            )}
          </Card>

          <Card className="min-w-0 flex-[2_1_300px] gap-3 p-4">
            <span className="text-ink-muted text-[13px] font-semibold">The business, as {BRAND} reads it</span>
            <p className="text-[13.5px] leading-relaxed">
              Kagera buys raw milk from about 2,400 farmers <SourceChip>Supplier list</SourceChip>, makes UHT milk and
              yoghurt, and sells to supermarkets and 31 distributors <SourceChip>Customer master</SourceChip>. Revenue
              is recognised on delivery <SourceChip>FY25 FS note 2.4</SourceChip>.
            </p>
            <span className="text-ink-muted mt-1 text-[13px] font-semibold">Who approves payments</span>
            <dl>
              {APPROVAL_TIERS.map((t) => (
                <div key={t.band} className="flex items-center gap-2.5 border-b py-2 text-[13px]">
                  <dt className="tnum w-[110px]">{t.band}</dt>
                  <dd>{t.who}</dd>
                </div>
              ))}
            </dl>
            <p className="text-ink-muted text-xs">
              From <Sources items={['Finance policy v4 p.3']} />. {BRAND} will test every payment against these limits
              in stage 6.
            </p>
          </Card>
        </div>
      </div>

      <SignLine
        sticky
        signed={signed}
        className="mt-auto"
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to={engagementPath(e.id, 'requests')}>Review the {MISSING} requests</Link>
            </Button>
            <Button onClick={() => sign(`Confirmed the picture and sent ${MISSING} requests`)}>
              Confirm and send requests
            </Button>
          </>
        }
      >
        Confirm this picture of the business and the control list. The {MISSING} missing documents become client
        requests.
      </SignLine>
    </div>
  )
}
