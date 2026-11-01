import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'

import { Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { CLIENT_REQUEST as R, FIRM, millions, type DeliveryNote } from '../mock'

/**
 * Board 31: the client answers a request on their phone, from a link, without an account.
 * Rendered outside the app shell.
 */
export function ClientRequestPage() {
  const [answer, setAnswer] = useState(R.answer)
  const [photos, setPhotos] = useState(0)
  const [sent, setSent] = useState(false)
  const camera = useRef<HTMLInputElement>(null)

  return (
    <div className="bg-ground text-ink mx-auto flex min-h-svh w-full max-w-[430px] flex-col">
      <header className="bg-sheet border-rule flex flex-col gap-2.5 border-b px-4 pt-[18px] pb-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold">{FIRM}</span>
          <span className="text-ink-muted text-[12.5px]">
            Request {R.index} of {R.of}
          </span>
        </div>
        <div
          className="bg-fill h-1 rounded-sm"
          role="progressbar"
          aria-label="Answered so far"
          aria-valuenow={Math.round(R.progress * 100)}
        >
          <div className="bg-ochre h-1 rounded-sm" style={{ width: `${R.progress * 100}%` }} />
        </div>
        <h1 className="text-[21px] leading-[1.3] font-semibold tracking-[-0.01em]">{R.question}</h1>
        <p className="text-ink-muted text-[12.5px]">
          Asked by {R.askedBy} for the {R.audit} audit · due {R.due}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-3 py-3.5">
        <div className="bg-sheet border-rule flex flex-col gap-2 rounded-[14px] border px-4 py-3.5">
          <label htmlFor="why" className="text-[13px] font-semibold">
            {R.prompt}
          </label>
          <textarea
            id="why"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="border-rule h-[78px] resize-none rounded-[10px] border px-3 py-2.5 text-sm"
          />
        </div>

        <section aria-label="Delivery notes" className="bg-sheet border-rule overflow-hidden rounded-[14px] border">
          <div className="border-rule flex items-center justify-between border-b px-4 py-3">
            <span className="text-[13px] font-semibold">Delivery notes</span>
            <span className="text-ink-muted text-[12.5px]">
              {R.notesUploaded + photos} of {R.notesTotal}
            </span>
          </div>
          <ul>
            {R.notes.map((n) => (
              <NoteRow key={n.invoice} note={n} />
            ))}
          </ul>
        </section>

        <input
          ref={camera}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          hidden
          aria-label="Photograph notes"
          onChange={(e) => setPhotos((p) => p + (e.target.files?.length ?? 0))}
        />
        <Button variant="secondary" className="w-full" onClick={() => camera.current?.click()}>
          <Camera className="size-[18px]" aria-hidden="true" />
          Photograph notes
        </Button>
        <p className="text-ink-muted px-3 text-center text-[12.5px]">
          Snap several at once. We match each photo to its invoice and tell you straight away if something is missing.
        </p>
      </main>

      <footer className="bg-sheet border-rule sticky bottom-0 flex flex-col gap-2 border-t px-4 pt-3 pb-5">
        {sent ? (
          <p role="status" className="text-pine py-3 text-center text-[15px] font-medium">
            Sent. Your auditor will see it now, and you can add the rest later from this link.
          </p>
        ) : (
          <Button className="w-full" onClick={() => setSent(true)}>
            Send what I have
          </Button>
        )}
        <p className="text-ink-muted text-center text-[12.5px]">
          Your files go only to your auditor. Powered by kebera.
        </p>
      </footer>
    </div>
  )
}

function NoteRow({ note: n }: { note: DeliveryNote }) {
  return (
    <li
      className={cn(
        'border-rule-soft flex min-h-14 items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0',
        n.state === 'query' && 'bg-ochre-wash',
      )}
    >
      {n.state === 'ok' && <Tickmark kind="agreed" />}
      {n.state === 'query' && <Tickmark kind="query" />}
      {n.state === 'missing' && (
        <Tickmark kind="note" className="border-ink-muted text-ink-muted border-dashed" label="Not checked">
          ·
        </Tickmark>
      )}
      <div className="min-w-0 flex-1">
        <div>{n.invoice}</div>
        <div className={cn('text-[12.5px]', n.state === 'query' ? 'text-ochre' : 'text-ink-muted')}>{n.note}</div>
      </div>
      <span className="text-ink-muted tnum text-[12.5px]">{millions(n.amount)}</span>
    </li>
  )
}
