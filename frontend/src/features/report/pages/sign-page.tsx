import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'

import { PARTNER, SIGN_OFF as S } from '../mock'

const m = (n: number) => `${Math.round((n / 1_000_000) * 10) / 10}m`

/** Board 34: the partner reviews the close-out on their phone and signs. Only a person can sign. */
export function SignPage() {
  const { id = '' } = useParams()
  const [signedAt, setSignedAt] = useState<Date | null>(null)
  const [question, setQuestion] = useState(false)
  const pctOf = (n: number) => `${(n / S.overall) * 100}%`

  return (
    <div className="bg-ground text-ink mx-auto flex min-h-svh w-full max-w-[430px] flex-col">
      <header className="flex flex-col gap-1.5 px-4 pt-[18px] pb-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="bg-ink text-sheet inline-flex size-6 items-center justify-center rounded-[7px] font-mono text-[13px]">
              k
            </span>
            kebera
          </span>
          <span className="text-ink-muted text-[12.5px]">{signedAt ? 'Nothing to sign' : '1 to sign'}</span>
        </div>
        <h1 className="mt-2 text-2xl leading-[1.2] font-semibold tracking-[-0.015em]">
          {S.client} is ready for your signature
        </h1>
        <p className="text-ink-muted text-[12.5px]">
          {S.period} · prepared by {S.preparedBy} · file {S.fileVersion}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-3 py-1.5">
        <section className="bg-sheet border-rule rounded-[14px] border p-4">
          <div className="text-ink-muted text-[13px] font-semibold">Uncorrected errors</div>
          <div className="mt-1.5 mb-3 flex items-baseline gap-2">
            <b className="tnum text-[26px] font-bold">{m(S.uncorrected)}</b>
            <span className="text-ink-muted text-[12.5px]">of {m(S.overall)} materiality</span>
          </div>
          <div
            className="relative h-2.5 rounded-[5px] bg-[#F2F2F5]"
            role="img"
            aria-label={`${m(S.uncorrected)} uncorrected; performance materiality ${m(S.performance)}; overall ${m(S.overall)}`}
          >
            <div className="bg-vermilion absolute left-0 h-2.5 rounded-[5px]" style={{ width: pctOf(S.uncorrected) }} />
            <div className="bg-ink absolute -top-[5px] h-5 w-0.5" style={{ left: pctOf(S.performance) }} />
          </div>
          <div className="text-ink-muted mt-2 flex justify-between text-[12.5px]">
            <span>0</span>
            <span className="mr-[12%] ml-auto">PM {m(S.performance)}</span>
            <span>{m(S.overall)}</span>
          </div>
        </section>

        <ul className="bg-sheet border-rule overflow-hidden rounded-[14px] border">
          {S.checks.map((c) => (
            <li
              key={c.text}
              className="border-rule-soft flex min-h-[52px] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <Tickmark kind="agreed" confirmed />
              <span className="flex-1">{c.text}</span>
              {'when' in c && <span className="text-ink-muted text-[12.5px]">{c.when}</span>}
            </li>
          ))}
        </ul>

        <section className="bg-sheet border-rule flex flex-col gap-1 rounded-[14px] border px-4 py-3.5">
          <div className="text-ink-muted text-[13px] font-semibold">You are signing</div>
          <div className="text-[15px] font-medium">{S.opinion}</div>
          <p className="text-ink-muted text-[12.5px]">Read the full report before signing. It opens on this phone.</p>
          <Link to={`/engagements/${id}/report`} className="text-link mt-1.5 text-sm font-medium">
            Read the report, {S.reportPages} pages
          </Link>
        </section>
      </main>

      <footer className="bg-sheet border-ink sticky bottom-0 flex flex-col gap-2 border-t-[1.5px] border-dashed px-4 pt-3 pb-5">
        <div className="text-ink text-[13px] font-semibold">Your call</div>
        {signedAt ? (
          <p role="status" className="flex items-center justify-center gap-2 py-2 text-[15px] font-medium">
            <Tickmark kind="signed" confirmed />
            Signed as {PARTNER.name} at {signedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        ) : question ? (
          <p role="status" className="py-2 text-center text-[15px]">
            Sent back to {S.preparedBy}. The file stays unsigned until you sign it.
          </p>
        ) : (
          <>
            <Button className="w-full" onClick={() => setSignedAt(new Date())}>
              Sign as {PARTNER.name}
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setQuestion(true)}>
              Send back with a question
            </Button>
          </>
        )}
        <p className="text-ink-muted text-center text-[12.5px]">
          Your name, the time and file {S.fileVersion} are sealed into the record.
        </p>
      </footer>
    </div>
  )
}
