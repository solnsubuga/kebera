import { useState, type ReactNode } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Chip, SignLine, SourceChip, Tickmark } from '@/components/tickmark'

import { PlanComment } from '../components/plan-comment'
import { PlanningTabs } from '../components/planning-tabs'
import { PLAN, PLAN_COMMENTS } from '../sample-data'

const TOC = [
  { id: 'scope', label: 'Scope' },
  { id: 'mat', label: 'Materiality' },
  { id: 'risks', label: 'Significant risks' },
  { id: 'time', label: 'Timetable' },
  { id: 'signoff', label: 'Sign-off' },
]

export function PlanPage() {
  const { id = '' } = useParams()
  const [open, setOpen] = useState(PLAN_COMMENTS.map((c) => c.id))
  const [approved, setApproved] = useState(false)

  function resolveAll() {
    setOpen([])
    toast.success(open.length === 1 ? 'Comment resolved' : `${open.length} comments resolved`)
  }

  function approve() {
    setApproved(true)
    toast.success('Plan approved and locked')
  }

  return (
    <>
      <PlanningTabs id={id} />

      <div className="bg-sheet flex flex-1 flex-wrap justify-center gap-8 px-6 py-8">
        <nav aria-label="Plan sections" className="hidden min-w-[150px] flex-[0_1_170px] lg:block">
          <div className="text-ink-muted pb-1.5 text-[13px] font-semibold">On this page</div>
          {TOC.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="text-ink-muted hover:text-foreground block py-[5px] text-[13px]">
              {t.label}
            </a>
          ))}
        </nav>

        <article className="max-w-[700px] min-w-0 flex-[1_1_560px] font-serif text-[17px] leading-[1.65] [&_h2]:mt-[26px] [&_h2]:mb-2.5 [&_h2]:scroll-mt-4 [&_h2]:font-sans [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_p]:mb-3">
          <div className="text-ink-muted mb-2 flex items-center gap-2 font-sans text-xs">
            <Tickmark kind="agreed" size="sm" className="size-4 text-[9px]" />
            {PLAN.draftedBy}
          </div>
          <h1 className="mb-4 font-serif text-[30px] leading-[1.15] font-medium tracking-[-0.01em] md:text-[38px]">
            {PLAN.title}
          </h1>

          <dl className="border-rule-soft mb-5 border-y py-2 font-sans text-[13.5px]">
            <Prop label="Status">
              <Chip>{approved ? 'Approved · locked' : PLAN.status}</Chip>
            </Prop>
            <Prop label="Framework">{PLAN.framework}</Prop>
            <Prop label="Materiality" id="mat">
              <span className="tabular-nums">{PLAN.materiality}</span> <SourceChip>{PLAN.materialitySource}</SourceChip>
            </Prop>
          </dl>

          <h2 id="scope">Scope</h2>
          <p>
            {PLAN.scope.before} <SourceChip>{PLAN.scope.source}</SourceChip>
            {PLAN.scope.after}
          </p>

          <h2 id="risks">Significant risks and our response</h2>
          <div className="border-link/30 mt-1 mb-3.5 overflow-hidden rounded-[10px] border font-sans text-[13px]">
            <div className="bg-link-wash text-link flex justify-between px-3 py-2 text-xs">
              <span>Live from the risk matrix · updates when ratings change</span>
              <span>{PLAN.risks.length} rows</span>
            </div>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="text-ink-muted border-rule-soft border-b text-xs">
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">Assertions</th>
                  <th className="px-3 py-2 font-medium">Response</th>
                </tr>
              </thead>
              <tbody>
                {PLAN.risks.map((r) => (
                  <tr key={r.risk} className="border-rule-soft border-b last:border-b-0">
                    <td className="px-3 py-2">{r.risk}</td>
                    <td className="px-3 py-2">{r.assertions}</td>
                    <td className="px-3 py-2">{r.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {PLAN.relatedParty.before} <SourceChip>{PLAN.relatedParty.source}</SourceChip>
            {PLAN.relatedParty.after}
          </p>

          <h2 id="time">Timetable</h2>
          <p className="text-ink-muted">{PLAN.timetable}</p>
        </article>

        <aside className="flex min-w-[220px] flex-[0_1_250px] flex-col gap-3 lg:pt-[330px]" aria-label="Comments">
          {PLAN_COMMENTS.filter((c) => open.includes(c.id)).map((c) => (
            <PlanComment key={c.id} comment={c} />
          ))}
        </aside>
      </div>

      <div id="signoff" className="sticky bottom-0 z-10">
        <SignLine
          sticky
          actions={
            <>
              {open.length > 0 && (
                <Button variant="secondary" onClick={resolveAll}>
                  Resolve {open.length} comment{open.length === 1 ? '' : 's'}
                </Button>
              )}
              <Button onClick={approve} disabled={approved}>
                {approved ? 'Plan approved' : 'Approve plan'}
              </Button>
            </>
          }
        >
          {approved
            ? 'The plan is locked. Changes from now on are logged as plan amendments.'
            : 'Partner approval locks the plan. Changes after that are logged as plan amendments.'}
        </SignLine>
      </div>
    </>
  )
}

function Prop({ label, id, children }: { label: string; id?: string; children: ReactNode }) {
  return (
    <div id={id} className="flex scroll-mt-4 gap-4 py-[5px]">
      <dt className="text-ink-muted w-[150px] shrink-0">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
