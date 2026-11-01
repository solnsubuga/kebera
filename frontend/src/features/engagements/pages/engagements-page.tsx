import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { STAGES, STATUS_STAGE, stageIndex, type StageKey } from '@/components/layout/stages'
import { Chip, SampleChip, Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useEngagements } from '../api'
import { NewEngagementDialog } from '../components/new-engagement-dialog'
import { markKind } from '../marks'
import { engagementPath } from '../paths'
import {
  ENGAGEMENT_EXTRAS,
  WAITING_COUNTS,
  WAITING_ON_CLIENTS,
  WAITING_ON_YOU,
  type EngagementExtras,
} from '../sample-data'
import { FRAMEWORKS, STATUSES, STATUS_LABEL, type Engagement, type EngagementStatus } from '../types'

function greeting(now = new Date()) {
  const h = now.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

/** 10 · Engagements (home): what waits on you, what waits on clients, and where every audit stands. */
export function EngagementsPage() {
  const [status, setStatus] = useState<EngagementStatus | undefined>()
  const all = useEngagements()
  const list = useEngagements(status)
  const everything = all.data?.items ?? []
  const active = everything.filter((e) => e.status !== 'signed').length
  const count = (s?: EngagementStatus) => (s ? everything.filter((e) => e.status === s).length : all.data?.total)
  const byClient = new Map(everything.map((e) => [e.client_name, e]))
  const linkFor = (client: string, to: Parameters<typeof engagementPath>[1]) => {
    const e = byClient.get(client)
    return e ? engagementPath(e.id, to) : undefined
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.022em]">{greeting()}</h1>
          <span className="text-ink-muted">
            {all.data ? `${active} active audits. ` : ''}
            {WAITING_COUNTS.mine} things wait on you, {WAITING_COUNTS.theirs} wait on clients.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SampleChip />
          <NewEngagementDialog />
        </div>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <Queue title="Waiting on you" count={WAITING_COUNTS.mine}>
          {WAITING_ON_YOU.map((q) => (
            <QueueRow
              key={q.title}
              to={linkFor(q.client, q.to)}
              mark={
                <Tickmark kind={markKind(q.mark)} size="sm" confirmed={false}>
                  {q.mark === 'exception' ? undefined : q.glyph}
                </Tickmark>
              }
              title={q.title}
              detail={q.detail}
              trailing={
                q.primary ? (
                  <Button size="sm" tabIndex={-1} asChild>
                    <span>{q.primary}</span>
                  </Button>
                ) : (
                  <span className="text-ink-muted text-[12.5px]">{q.when}</span>
                )
              }
            />
          ))}
        </Queue>
        <Queue title="Waiting on clients" count={WAITING_COUNTS.theirs} client>
          {WAITING_ON_CLIENTS.map((q) => (
            <QueueRow
              key={q.title}
              to={linkFor(q.client, q.to)}
              mark={<Tickmark kind="query" size="sm" />}
              title={q.title}
              detail={
                <>
                  {q.detail}
                  {q.amount && <span className="tnum whitespace-nowrap"> {q.amount}</span>}
                </>
              }
              trailing={
                q.late ? (
                  <span className="text-vermilion text-[12.5px]">{q.late}</span>
                ) : (
                  <span className="text-ink-muted text-[12.5px]">{q.when}</span>
                )
              }
            />
          ))}
        </Queue>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by phase">
          {[undefined, ...STATUSES].map((s) => (
            <button
              key={s ?? 'all'}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className="rounded-full"
            >
              <Chip pressed={status === s} className={cn(status !== s && 'bg-transparent')}>
                {s ? STATUS_LABEL[s] : 'All'}
                {count(s) !== undefined && <span className="tnum opacity-70">{count(s)}</span>}
              </Chip>
            </button>
          ))}
        </div>
        <EngagementsTable status={status} query={list} />
      </section>
    </div>
  )
}

function EngagementsTable({ status, query }: { status?: EngagementStatus; query: ReturnType<typeof useEngagements> }) {
  const { data, isPending, isError, refetch } = query
  if (isError)
    return (
      <div className="rounded-xl border p-6 text-sm">
        Could not load engagements.{' '}
        <Button variant="link" className="h-auto p-0" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    )
  if (isPending)
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  if (data.items.length === 0)
    return (
      <div className="text-ink-muted rounded-xl border border-dashed p-10 text-center text-sm">
        {status
          ? `No engagements in ${STATUS_LABEL[status].toLowerCase()}.`
          : 'No engagements yet. Open the first one.'}
      </div>
    )
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="text-ink-muted border-b text-left text-xs whitespace-nowrap">
            <th className="px-3.5 py-2 font-medium">Client</th>
            <th className="px-3.5 py-2 font-medium">Year end</th>
            <th className="px-3.5 py-2 font-medium">Stage</th>
            <th className="px-3.5 py-2 text-right font-medium">Exceptions open</th>
            <th className="px-3.5 py-2 text-right font-medium">Materiality</th>
            <th className="px-3.5 py-2 font-medium">Misstatements vs performance</th>
            <th className="px-3.5 py-2 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((e) => (
            <EngagementRow key={e.id} e={e} extras={ENGAGEMENT_EXTRAS[e.client_name]} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Queue(props: { title: string; count: number; client?: boolean; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div
        className={cn(
          'flex items-center justify-between border-b px-3.5 py-3',
          props.client ? 'bg-ochre-wash text-ochre' : 'bg-ground',
        )}
      >
        <h2 className={cn('text-[13px] font-semibold', props.client ? 'text-ochre' : 'text-ink')}>{props.title}</h2>
        <span className={cn('tnum text-xs', props.client ? 'text-ochre' : 'text-ink-muted')}>{props.count}</span>
      </div>
      <div className="[&>*:last-child]:border-b-0">{props.children}</div>
    </div>
  )
}

function QueueRow(props: { to?: string; mark: ReactNode; title: string; detail: ReactNode; trailing: ReactNode }) {
  const body = (
    <>
      {props.mark}
      <div className="min-w-0 flex-1">
        <div className="font-medium">{props.title}</div>
        <div className="text-ink-muted text-[12.5px]">{props.detail}</div>
      </div>
      {props.trailing}
    </>
  )
  const cls = 'flex items-center gap-3 border-b border-rule-soft px-3.5 py-3'
  return props.to ? (
    <Link to={props.to} className={cn(cls, 'hover:bg-ground')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

function StageProgress({ stage }: { stage: StageKey }) {
  const at = stageIndex(stage)
  return (
    <span className="inline-flex gap-[3px]" aria-hidden="true">
      {STAGES.map((s, i) => (
        <i
          key={s.key}
          className={cn('block h-1.5 w-3.5 rounded-[2px]', i < at ? 'bg-pine' : i === at ? 'bg-ink' : 'bg-rule')}
        />
      ))}
    </span>
  )
}

function EngagementRow({ e, extras }: { e: Engagement; extras?: EngagementExtras }) {
  const stageKey = extras?.stage ?? STATUS_STAGE[e.status]
  const stage = STAGES[stageIndex(stageKey)]
  const m = extras?.misstatements ?? { kind: 'text' as const, text: 'Not tested yet' }
  const exceptions = extras?.exceptions ?? null
  return (
    <tr className="border-rule-soft h-[52px] border-b whitespace-nowrap last:border-b-0">
      <td className="px-3.5">
        <Link to={engagementPath(e.id, stageKey)} className="font-medium hover:underline">
          {e.client_name}
        </Link>
        <div className="text-ink-muted text-xs">{extras?.kind ?? FRAMEWORKS[e.framework]}</div>
      </td>
      <td className="tnum px-3.5">{formatDate(e.period_end)}</td>
      <td className="px-3.5">
        <div className="flex items-center gap-2.5">
          <StageProgress stage={stageKey} />
          {stage.label}
        </div>
      </td>
      <td
        className={cn(
          'tnum px-3.5 text-right',
          exceptions ? 'text-vermilion' : exceptions === null && 'text-ink-muted',
        )}
      >
        {exceptions ?? '–'}
      </td>
      <td className={cn('tnum px-3.5 text-right', !extras?.materiality && 'text-ink-muted')}>
        {extras?.materiality ?? '–'}
      </td>
      <td className="px-3.5">
        {m.kind === 'bar' ? (
          <div className="flex items-center gap-2">
            <div className="bg-fill h-1.5 w-[120px] overflow-hidden rounded-[3px]">
              <div
                className={cn('h-1.5', m.tone === 'exception' ? 'bg-vermilion' : 'bg-pine')}
                style={{ width: `${m.pct}%` }}
              />
            </div>
            <span className="tnum text-xs">
              {m.used} / {m.of}m
            </span>
          </div>
        ) : (
          <span className={m.tone === 'client' ? 'text-ochre' : 'text-ink-muted'}>{m.text}</span>
        )}
      </td>
      <td className={cn('px-3.5', !extras && 'text-ink-muted')}>{extras?.due ?? '–'}</td>
    </tr>
  )
}
