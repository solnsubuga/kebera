import { useState } from 'react'
import { toast } from 'sonner'

import { Kbd, SignLine, SourceChip, Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { useListKeys } from '@/hooks/use-list-keys'
import { cn } from '@/lib/utils'

import { TestStage } from '../components/test-stage'
import {
  EXCEPTION_DETAIL,
  JUDGED_EARLIER,
  JUDGED_TODAY,
  MORE_OPEN,
  OPEN_EXCEPTIONS,
  type JudgedItem,
  type Judgment,
  type QueueItem,
} from '../mock-data'

const VERDICT: Record<Judgment, { label: string; done: string }> = {
  right: { label: "Right, it's an exception", done: 'right' },
  wrong: { label: 'Wrong', done: 'wrong' },
  escalate: { label: 'Escalate', done: 'escalated' },
  ask: { label: 'Ask client', done: 'asked client' },
}

export function ExceptionsPage() {
  const [open, setOpen] = useState<QueueItem[]>(OPEN_EXCEPTIONS)
  const [judged, setJudged] = useState<JudgedItem[]>(JUDGED_TODAY)
  const [index, setIndex] = useState(0)
  const [note, setNote] = useState('')

  const current = open[index]
  const openCount = open.length + MORE_OPEN
  const judgedCount = JUDGED_EARLIER + judged.length
  const total = openCount + judgedCount

  function judge(judgment: Judgment) {
    if (!current) return
    const by = 'GA'
    setJudged((j) => [{ title: current.title, ref: current.ref, judgment, note: note.trim() || undefined, by }, ...j])
    setOpen((o) => o.filter((x) => x.id !== current.id))
    setIndex((i) => Math.max(0, Math.min(i, open.length - 2)))
    setNote('')
    toast(`${current.ref} marked ${VERDICT[judgment].done}`)
  }

  useListKeys({
    count: open.length,
    index,
    onIndexChange: setIndex,
    keys: { r: () => judge('right'), w: () => judge('wrong'), e: () => judge('escalate'), q: () => judge('ask') },
  })

  return (
    <TestStage
      flush
      signLine={
        <SignLine
          sticky
          label="Your call"
          actions={
            <>
              <Button variant="secondary" onClick={() => judge('ask')} disabled={!current}>
                Ask client <Kbd>Q</Kbd>
              </Button>
              <Button variant="secondary" onClick={() => judge('escalate')} disabled={!current}>
                Escalate <Kbd>E</Kbd>
              </Button>
              <Button variant="secondary" onClick={() => judge('wrong')} disabled={!current}>
                Wrong <Kbd>W</Kbd>
              </Button>
              <Button variant="graphite" onClick={() => judge('right')} disabled={!current}>
                Right, it&apos;s an exception <Kbd>R</Kbd>
              </Button>
            </>
          }
        >
          <label htmlFor="exception-note" className="sr-only">
            Note
          </label>
          <input
            id="exception-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="bg-sheet h-10 w-full min-w-[200px] rounded-lg border px-3 text-[13px]"
          />
        </SignLine>
      }
    >
      <div className="flex min-h-0 flex-1 flex-wrap">
        <aside className="flex min-w-[240px] flex-[0_1_300px] flex-col border-r" aria-label="Exception queue">
          <div className="flex items-center justify-between border-b p-3">
            <b className="text-[13px]">Open {openCount}</b>
            <span className="text-ink-muted flex items-center gap-1 text-xs">
              {judgedCount} judged · <Kbd>J</Kbd> <Kbd>K</Kbd>
            </span>
          </div>
          <div
            className="bg-fill h-1"
            role="progressbar"
            aria-label="Judged"
            aria-valuenow={judgedCount}
            aria-valuemax={total}
          >
            <div className="bg-pine h-1 transition-[width]" style={{ width: `${(judgedCount / total) * 100}%` }} />
          </div>
          <ul>
            {open.map((x, i) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  className={cn(
                    'flex w-full items-start gap-2.5 border-b px-3 py-2.5 text-left',
                    i === index && 'bg-fill shadow-[inset_2px_0_0_var(--color-foreground)]',
                  )}
                >
                  <Tickmark kind="exception" />
                  <QueueText
                    title={x.title}
                    meta={
                      <>
                        {x.ref} · <span className="tnum">{x.amount}</span> · {x.test}
                      </>
                    }
                  />
                </button>
              </li>
            ))}
          </ul>
          {MORE_OPEN > 0 && (
            <div className="text-ink-muted border-b py-2.5 pr-3 pl-[42px] text-xs">{MORE_OPEN} more</div>
          )}
          <div className="text-ink-muted border-b p-3 text-[13px] font-semibold">Judged today</div>
          <ul>
            {judged.map((x) => (
              <li key={x.ref} className="animate-in fade-in flex items-start gap-2.5 border-b px-3 py-2.5 duration-150">
                <Tickmark {...judgedMark(x.judgment)} confirmed />
                <QueueText
                  title={x.title}
                  meta={`${x.ref} · ${VERDICT[x.judgment].done}${x.note ? `: ${x.note}` : ''} · ${x.by}`}
                />
              </li>
            ))}
          </ul>
        </aside>
        <section className="bg-ground flex min-w-0 flex-[999_1_560px] flex-col">
          {current ? <Detail item={current} position={index + 1} of={openCount} /> : <AllJudged />}
        </section>
      </div>
    </TestStage>
  )
}

/** A person's verdict becomes a solid mark: an exception they confirmed, or a cleared item. */
function judgedMark(j: Judgment): { kind: 'exception' | 'agreed' | 'query' } {
  if (j === 'right') return { kind: 'exception' }
  if (j === 'wrong') return { kind: 'agreed' }
  return { kind: 'query' }
}

function QueueText({ title, meta }: { title: string; meta: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-[13px] font-medium">{title}</div>
      <div className="text-ink-muted text-xs">{meta}</div>
    </div>
  )
}

function AllJudged() {
  return (
    <div className="text-ink-muted flex flex-1 items-center justify-center p-10 text-sm">
      Every listed exception is judged.
    </div>
  )
}

function Detail({ item, position, of }: { item: QueueItem; position: number; of: number }) {
  const d = item.id === EXCEPTION_DETAIL.id ? EXCEPTION_DETAIL : null
  return (
    <>
      <div className="flex flex-col gap-2 px-[22px] pt-[18px] pb-1.5">
        <div className="text-ink-muted flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono">{d?.ref ?? item.ref}</span>·<span>{d?.test ?? item.test}</span>
          {d && (
            <>
              ·<span>Assertion: {d.assertion}</span>
            </>
          )}
          ·
          <span>
            {position} of {of}
          </span>
        </div>
        <h1 className="text-[22px] leading-snug font-semibold tracking-tight">
          {d ? (
            <>
              {d.headline[0]}
              <span className="tnum">{d.headline[1]}</span>
              {d.headline[2]}
            </>
          ) : (
            item.title
          )}
        </h1>
        {d && <p className="text-ink-muted text-[13.5px] leading-relaxed">{d.summary}</p>}
      </div>
      {d ? (
        <Evidence />
      ) : (
        <p className="text-ink-muted px-[22px] pb-5 text-[13.5px]">
          The sample data only carries evidence for {EXCEPTION_DETAIL.ref}. Amount UGX {item.amount}.
        </p>
      )}
    </>
  )
}

function Pane({ title, source, children }: { title: string; source: string; children: React.ReactNode }) {
  return (
    <div className="bg-sheet flex flex-col overflow-hidden rounded-[10px] border">
      <PaneHead title={title} source={source} />
      {children}
    </div>
  )
}

function PaneHead({ title, source, divided }: { title: string; source: string; divided?: boolean }) {
  return (
    <div
      className={cn(
        'bg-fill/50 flex items-center justify-between border-b px-3 py-2 text-[12.5px]',
        divided && 'border-t',
      )}
    >
      <b className="font-medium">{title}</b>
      <SourceChip>{source}</SourceChip>
    </div>
  )
}

const docText = 'text-ink-muted px-3.5 py-3 font-mono text-[11.5px] leading-[1.7] whitespace-pre-wrap'
const highlight = 'bg-highlight text-foreground'

function Evidence() {
  const { ledger, bank, invoice, grns } = EXCEPTION_DETAIL
  return (
    <div className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 px-[22px] pt-2.5 pb-[18px]">
      <Pane title="Ledger" source={ledger.source}>
        <dl className="flex flex-col gap-1.5 px-3.5 py-3 text-[12.5px]">
          {ledger.rows.map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-ink-muted">{k}</dt>
              <dd className={cn(k === 'Amount' && 'tnum')}>{v}</dd>
            </div>
          ))}
          <div className={cn('-mx-2 mt-1 flex justify-between rounded-md px-2 py-1.5', highlight)}>
            <dt>{ledger.flag[0]}</dt>
            <dd>{ledger.flag[1]}</dd>
          </div>
        </dl>
        <PaneHead title="Bank" source={bank.source} divided />
        <div className={docText}>
          {bank.before}
          <mark className={highlight}>{bank.marked}</mark>
          {bank.after}
        </div>
      </Pane>
      <Pane title={invoice.title} source={invoice.source}>
        <div className={docText}>
          {invoice.before}
          <mark className={highlight}>{invoice.marked}</mark>
          {invoice.after}
        </div>
      </Pane>
      <Pane title="Goods received notes" source={grns.source}>
        <div className="flex flex-col gap-2 px-3.5 py-3 text-[12.5px]">
          {grns.rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <span>{k}</span>
              <span className="tnum">{v}</span>
            </div>
          ))}
          <div className="border-vermilion text-vermilion rounded-lg border-[1.5px] border-dashed p-2.5 text-center">
            {grns.missing}
          </div>
          <div className="text-ink-muted text-xs">
            {grns.query} <SourceChip>{grns.run}</SourceChip>
          </div>
        </div>
      </Pane>
    </div>
  )
}
