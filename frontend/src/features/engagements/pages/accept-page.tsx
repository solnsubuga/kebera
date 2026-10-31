import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SampleChip, SignLine, Tickmark } from '@/components/tickmark'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

import { useSignOff } from '../use-sign-off'
import { Sources } from '../components/source-list'
import { ACCEPT_CHECKS, ACCEPT_RUN } from '../sample-data'
import { markKind } from '../marks'

/** 11 · Accept the client: the background checks, the drafted letter, and the accept decision. */
export function AcceptPage() {
  const [signed, sign] = useSignOff()
  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-ground flex flex-1 flex-wrap items-start gap-5 p-6">
        <section className="flex min-w-0 flex-[3_1_520px] flex-col gap-4">
          <div className="flex flex-col gap-1">
            <SampleChip className="self-start" />
            <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.022em]">
              Should we take on Kagera Dairies?
            </h1>
            <p className="text-ink-muted">
              {BRAND} ran the background checks. Integrity and independence are yours to judge.
            </p>
          </div>
          <Card className="gap-0 overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <span className="text-link font-medium">
                {BRAND} checked {ACCEPT_CHECKS.length} things
              </span>
              <span className="tnum text-ink-muted text-xs">{ACCEPT_RUN}</span>
            </div>
            <ul>
              {ACCEPT_CHECKS.map((c) => (
                <li
                  key={c.title}
                  className={cn(
                    'flex items-start gap-3 border-b px-4 py-3.5 last:border-b-0',
                    c.mark === 'exception' && 'bg-vermilion-wash',
                  )}
                >
                  <Tickmark kind={markKind(c.mark)} />
                  <div className="flex-1">
                    <span className="font-medium">{c.title}</span>
                    {c.rest}
                    {c.amount && <span className="tnum whitespace-nowrap">{c.amount}</span>}
                    {c.restAfter}
                    {(c.note || c.sources.length > 0 || c.tail) && (
                      <div className="text-ink-muted mt-1 text-xs">
                        {c.note}
                        <Sources items={c.sources} />
                        {c.tail && <> · {c.tail}</>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="flex min-w-0 flex-[2_1_380px] flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted text-[13px] font-semibold">Engagement letter · draft</span>
            <span className="text-ink-muted text-xs">{BRAND} drafted · edit freely</span>
          </div>
          <Card className="gap-3 p-7 font-serif text-base leading-relaxed" aria-label="Engagement letter draft">
            <p>
              The Directors
              <br />
              Kagera Dairies Ltd
            </p>
            <p>
              You have asked us to audit the financial statements of Kagera Dairies Ltd for the year ending 30 June
              2026, prepared under IFRS for SMEs.
            </p>
            <p className="bg-link-wash rounded-md px-3 py-2.5">
              <b className="font-semibold">Use of software.</b> We use {BRAND}, software that reads your records and
              runs tests on them. Your data is stored in [REGION], is not used to train any model, and is deleted [N]
              days after we sign. A partner of this firm reviews all of its work and alone forms the opinion.
            </p>
            <p className="text-ink-muted">Responsibilities of management… Fees… Timetable…</p>
          </Card>
        </section>
      </div>

      <SignLine
        sticky
        signed={signed}
        className="mt-auto"
        actions={
          <>
            <Button variant="secondary" onClick={() => sign('Declined the engagement')}>
              Decline
            </Button>
            <Button
              variant="secondary"
              onClick={() => sign('Accepted on condition the clearance arrives before fieldwork')}
            >
              Accept with condition
            </Button>
            <Button onClick={() => sign('Accepted and sent the engagement letter')}>Accept and send letter</Button>
          </>
        }
      >
        One related party and one missing clearance. You can accept now on condition the clearance arrives before
        fieldwork.
      </SignLine>
    </div>
  )
}
