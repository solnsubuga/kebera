import { useState } from 'react'
import { toast } from 'sonner'

import { SampleChip, SignLine, SourceChip, Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { useListKeys } from '@/hooks/use-list-keys'
import { cn } from '@/lib/utils'

import { CONTACT, REQUESTS, type ClientRequest, type RequestState } from '../mock'

const GROUPS: { state: RequestState; label: string; className: string; mark: React.ReactNode }[] = [
  {
    state: 'draft',
    label: 'Drafted by kebera',
    className: '',
    mark: (
      <Tickmark kind="note" size="sm" className="border-link text-link border-dashed" label="Drafted by kebera">
        ·
      </Tickmark>
    ),
  },
  { state: 'waiting', label: 'Waiting on client', className: 'text-ochre', mark: <Tickmark kind="query" size="sm" /> },
  {
    state: 'answered',
    label: 'Answered and checked',
    className: 'text-pine',
    mark: <Tickmark kind="agreed" confirmed size="sm" />,
  },
]

/** Board 30: what the audit team still needs from the client, and the drafts waiting to go out. */
export function RequestsPage() {
  const [requests, setRequests] = useState(REQUESTS)
  const [selected, setSelected] = useState('R-05')
  const drafts = requests.filter((r) => r.state === 'draft')
  const current = requests.find((r) => r.code === selected) ?? requests[0]

  // J and K move through the list, as everywhere in kebera.
  const order = GROUPS.flatMap((g) => requests.filter((r) => r.state === g.state))
  useListKeys({
    count: order.length,
    index: Math.max(
      0,
      order.findIndex((r) => r.code === selected),
    ),
    onIndexChange: (i) => setSelected(order[i]!.code),
  })

  function sendDrafts() {
    setRequests((rs) => rs.map((r) => (r.state === 'draft' ? { ...r, state: 'waiting', when: 'Due 7 Nov' } : r)))
    toast.success(`${drafts.length} requests sent to R. Nansubuga`, { description: 'Due in 5 working days.' })
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="bg-ground flex flex-1 flex-wrap items-start gap-5 px-6 py-5">
        <section className="flex min-w-0 flex-[3_1_560px] flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.01em]">What we need from Kagera</h1>
              <p className="text-ink-muted mt-1 text-sm">
                Each request comes from a gap, an exception or a question. kebera drafts it in plain words and checks
                the answer when it arrives.
              </p>
            </div>
            <span className="flex items-center gap-2">
              <SampleChip />
              <span className="text-ink-muted text-xs">Contact: {CONTACT}</span>
            </span>
          </div>

          <div className="bg-sheet rounded-card shadow-card overflow-hidden">
            <ul aria-label="Client requests">
              {GROUPS.map((g) => {
                const items = requests.filter((r) => r.state === g.state)
                if (items.length === 0) return null
                return (
                  <li key={g.state}>
                    <div
                      className={cn(
                        'bg-ground border-rule flex items-center gap-2 border-b px-3.5 py-2 text-[12.5px] font-semibold',
                        g.className,
                      )}
                    >
                      {g.mark}
                      {g.label} <span className="text-ink-muted text-xs font-normal">{items.length}</span>
                    </div>
                    <ul>
                      {items.map((r) => (
                        <RequestRow
                          key={r.code}
                          request={r}
                          selected={r.code === current?.code}
                          onSelect={() => setSelected(r.code)}
                        />
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </div>
          <p className="text-ink-muted text-xs">
            Late requests are chased by kebera every 2 days in your name, with your approval once per engagement.
          </p>
        </section>

        {current && <ClientPreview request={current} />}
      </div>

      <SignLine
        sticky
        actions={
          <>
            <Button variant="secondary" onClick={() => setSelected('R-06')} disabled={drafts.length === 0}>
              Edit R-06
            </Button>
            <Button onClick={sendDrafts} disabled={drafts.length === 0}>
              Send {drafts.length} requests
            </Button>
          </>
        }
      >
        {drafts.length > 0
          ? `Send the ${drafts.length} drafted requests to R. Nansubuga, due in 5 working days.`
          : 'All drafted requests are sent. kebera checks each answer as it arrives.'}
      </SignLine>
    </div>
  )
}

function RequestRow({
  request: r,
  selected,
  onSelect,
}: {
  request: ClientRequest
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected || undefined}
        className={cn(
          'border-rule-soft hover:bg-ground flex min-h-[52px] w-full items-center gap-3 border-b px-3.5 py-2 text-left text-[13.5px] md:h-[52px] md:py-0',
          selected && 'bg-ground shadow-[inset_2px_0_0_var(--color-ink)]',
        )}
      >
        <span className="text-ink-muted font-mono text-xs">{r.code}</span>
        <span className="min-w-0 flex-1 md:truncate">{r.title}</span>
        <SourceChip>{r.source}</SourceChip>
        <span className={cn('w-[70px] text-xs', r.late ? 'text-vermilion' : 'text-ink-muted')}>{r.when}</span>
      </button>
    </li>
  )
}

function ClientPreview({ request: r }: { request: ClientRequest }) {
  return (
    <aside
      aria-label="What the client will see"
      className="bg-sheet rounded-card shadow-card min-w-0 flex-[2_1_360px] overflow-hidden"
    >
      <div className="border-rule flex items-center justify-between border-b px-4 py-3">
        <span className="text-ink-muted text-[13px] font-semibold">What the client will see</span>
        <span className="text-ink-muted text-xs">{r.state === 'draft' ? 'Editable' : 'Sent'}</span>
      </div>
      {r.preview ? (
        <div className="flex flex-col gap-3.5 px-5 py-[18px]">
          <div className="text-[17px] leading-[1.35] font-semibold">{r.preview.question}</div>
          <p className="text-sm leading-relaxed">{r.preview.body}</p>
          {r.preview.invoices.length > 0 && (
            <div className="border-rule overflow-hidden rounded-lg border text-[13px]">
              {r.preview.invoices.map((inv) => (
                <div key={inv.ref} className="border-rule-soft flex justify-between border-b px-3 py-2">
                  <span>
                    {inv.ref} · {inv.customer}
                  </span>
                  <span className="tnum">{inv.amount.toLocaleString('en-GB')}</span>
                </div>
              ))}
              {r.preview.moreInvoices > 0 && (
                <div className="text-ink-muted px-3 py-2 text-xs">{r.preview.moreInvoices} more invoices</div>
              )}
            </div>
          )}
          <div className="bg-ground text-ink-muted flex flex-col gap-1 rounded-lg p-3 text-[12.5px]">
            <b className="text-ink font-medium">kebera will accept the answer when</b>
            {r.preview.acceptWhen}
          </div>
          <p className="text-ink-muted text-xs">Sent by link. The client answers on any phone, without an account.</p>
        </div>
      ) : (
        <div className="text-ink-muted flex flex-col gap-2 px-5 py-[18px] text-sm">
          <div className="text-ink text-[17px] font-semibold">{r.title}</div>
          <p>
            {r.state === 'answered'
              ? 'Answered by the client and checked by kebera.'
              : `Sent to ${CONTACT.split(',')[0]}. ${r.late ? `${r.when}; kebera chases it every 2 days.` : `${r.when}.`}`}
          </p>
        </div>
      )}
    </aside>
  )
}
