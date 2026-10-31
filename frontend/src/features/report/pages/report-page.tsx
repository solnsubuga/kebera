import { Lock } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Chip, SampleChip, SignLine, SourceChip, Tickmark } from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { MANAGEMENT_LETTER as L, PARTNER, REPORT_TABS } from '../mock'

/** Board 33: the management letter kebera drafted from signed findings, kebera's reading of the opinion, and the hand-off to the partner. */
export function ReportPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const doc = REPORT_TABS.find((t) => t.key === params.get('doc')) ?? REPORT_TABS[0]
  const [letterSent, setLetterSent] = useState(false)

  return (
    <div className="flex min-h-full flex-col">
      <nav aria-label="Report documents" className="border-rule flex gap-1 overflow-x-auto border-b px-6 pt-2.5">
        {REPORT_TABS.map((t) => (
          <Link
            key={t.key}
            to={t.key === 'letter' ? '.' : `?doc=${t.key}`}
            aria-current={t.key === doc.key ? 'page' : undefined}
            className={cn(
              'text-ink-muted hover:text-ink -mb-px border-b-2 border-transparent px-3 py-2 text-[13px] whitespace-nowrap',
              t.key === doc.key && 'border-ink text-ink font-semibold',
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="bg-ground flex flex-1 flex-wrap items-start justify-center gap-6 p-6">
        {doc.key === 'letter' ? (
          <article className="bg-sheet border-rule max-w-[700px] min-w-0 flex-[1_1_560px] rounded-xl border px-11 py-9 font-serif text-base leading-[1.65]">
            <div className="text-ink-muted mb-1.5 font-sans text-xs">{L.provenance}</div>
            <h1 className="mb-3.5 font-serif text-[30px] leading-[1.2] font-medium">{L.title}</h1>
            <p className="mb-3">{L.intro}</p>
            {L.points.map((pt, i) => (
              <section key={pt.heading}>
                <h3 className="mt-5 mb-1.5 font-sans text-[14.5px] font-semibold">
                  {i + 1}. {pt.heading} <SourceChip>{pt.source}</SourceChip>
                </h3>
                <p className={pt.truncated ? 'text-ink-muted mb-3' : 'mb-3'}>
                  {pt.body}
                  {pt.truncated && '…'}
                </p>
                {pt.response && (
                  <div className="bg-ochre-wash border-ochre-rule mb-2 rounded-lg border px-3 py-2.5 font-sans text-[13px] text-[#5E3E00]">
                    <b className="font-semibold">Management response</b> ·{' '}
                    {letterSent ? pt.response.replace('requested', 'sent') : pt.response}
                  </div>
                )}
              </section>
            ))}
          </article>
        ) : (
          <div className="bg-sheet rounded-card shadow-card text-ink-muted max-w-[700px] min-w-0 flex-[1_1_560px] p-8 text-sm">
            kebera drafts the {doc.label.replace(/ \d+\/\d+$/, '').toLowerCase()} from signed-off findings only. This
            sample shows the management letter.
          </div>
        )}

        <aside className="flex min-w-[280px] flex-[0_1_340px] flex-col gap-3.5">
          <SampleChip className="self-start" />
          <section className="bg-sheet rounded-card shadow-card px-[18px] py-4">
            <div className="text-ink-muted text-[13px] font-semibold">Opinion</div>
            <div className="mt-2 mb-1 flex items-baseline justify-between gap-2">
              <b className="text-lg font-semibold">Unmodified</b>
              <Chip tone="link">kebera&apos;s reading</Chip>
            </div>
            <p className="text-ink-muted text-xs">Based on the file as it stands. The partner forms the opinion.</p>
            <ul className="mt-2.5">
              <Check>
                Uncorrected errors <span className="tnum">104.2m</span> below materiality{' '}
                <span className="tnum">180m</span>
              </Check>
              <Check>All 9 workpapers reviewed</Check>
              <Check>Related-party note names Lwera Feeds</Check>
              <Check open>Representation letter not yet signed by management</Check>
              <Check>Going concern: forecast fixed, 12 months covered</Check>
            </ul>
          </section>

          <section className="bg-sheet rounded-card shadow-card flex flex-col gap-2.5 px-[18px] py-4">
            <div className="text-ink-muted text-[13px] font-semibold">Signature</div>
            <div className="border-ink text-ink-muted flex h-16 items-end border-b-[1.5px] pb-1.5 text-xs">
              {PARTNER.name}, {PARTNER.role} · ICPAU practising number {PARTNER.practisingNumber}
            </div>
            <div className="text-ink-soft flex items-start gap-2 text-[12.5px]">
              <Lock className="mt-px size-4 shrink-0" aria-hidden="true" />
              Only the engagement partner can sign. kebera drafts, checks and files; it can never sign or issue an
              opinion.
            </div>
          </section>
        </aside>
      </div>

      <SignLine
        sticky
        actions={
          <>
            <Button
              variant="secondary"
              disabled={letterSent}
              onClick={() => {
                setLetterSent(true)
                toast.success('Letter sent to management', { description: 'Responses due 12 Nov.' })
              }}
            >
              {letterSent ? 'Letter sent' : 'Send letter to management'}
            </Button>
            <Button asChild>
              <Link to={`/engagements/${id}/report/sign`}>Send to partner</Link>
            </Button>
          </>
        }
      >
        Send the letter for management responses, and the file to D. Okello for signature once the representation letter
        is in.
      </SignLine>
    </div>
  )
}

function Check({ open, children }: { open?: boolean; children: React.ReactNode }) {
  return (
    <li className="border-rule-soft flex gap-2.5 border-b py-[9px] text-[13px] leading-[1.45] last:border-b-0">
      {open ? <Tickmark kind="query" /> : <Tickmark kind="agreed" confirmed />}
      <span>{children}</span>
    </li>
  )
}
