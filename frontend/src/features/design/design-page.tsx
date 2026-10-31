import { useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { useRegisterCommands } from '@/components/command'
import { EngagementHeader } from '@/components/layout/engagement-header'
import { PageHeader } from '@/components/layout/page-header'
import {
  AssertionRow,
  Chip,
  Kbd,
  MaterialityRuler,
  Money,
  RunReceipt,
  SampleChip,
  SignLine,
  SourceChip,
  Tickmark,
  type TickmarkKind,
} from '@/components/tickmark'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useListKeys } from '@/hooks/use-list-keys'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

const INKS = [
  { name: 'Graphite', token: 'ink', swatch: 'bg-ink text-on-ink', use: "Text, and a person's commitment." },
  { name: 'Blue', token: 'link', swatch: 'bg-link text-white', use: `What ${BRAND} wrote, ran or cited.` },
  { name: 'Pine', token: 'pine', swatch: 'bg-pine text-white', use: 'Agreed, ties out, covered.' },
  { name: 'Vermilion', token: 'vermilion', swatch: 'bg-vermilion text-white', use: 'Exception. Never decoration.' },
  {
    name: 'Ochre',
    token: 'ochre / ochre-wash',
    swatch: 'bg-ochre-wash text-ochre',
    use: 'The client, and anything waiting outside the firm.',
  },
  {
    name: 'Quiet grey',
    token: 'ground / rule',
    swatch: 'bg-ground text-ink-soft ring-1 ring-rule-strong',
    use: 'The ground white sheets float on.',
  },
]

const MARKS: { kind: TickmarkKind; label: string }[] = [
  { kind: 'agreed', label: 'Agreed to supporting document' },
  { kind: 'traced', label: 'Traced from source to ledger' },
  { kind: 'footed', label: 'Footed: recomputed in code' },
  { kind: 'exception', label: 'Exception found' },
  { kind: 'query', label: 'Query open with client' },
]

type Row = { id: string; title: string; ref: string; amount: number; verdict?: 'right' | 'wrong' | 'escalated' }
const QUEUE: Row[] = [
  { id: 'PV-0611', title: 'Lwera Feeds · no goods note', ref: 'PV-0611', amount: 96_000_000 },
  { id: 'PV-0588', title: 'Lwera Feeds · over limit, no note', ref: 'PV-0588', amount: 72_500_000 },
  { id: 'PV-0533', title: 'Nile Fuel · GM approved alone', ref: 'PV-0533', amount: 61_000_000 },
  { id: 'JE-1906', title: 'Journal by GM on a Sunday', ref: 'JE-1906', amount: 40_000_000 },
]

const demoEngagement = {
  id: 'demo',
  client_name: 'Kagera Dairies Ltd',
  period_end: '2026-06-30',
  framework: 'ifrs_sme' as const,
  status: 'fieldwork' as const,
}

/** Every Tickmark component on one page, with sample data, for review and screenshots. */
export function DesignPage() {
  const [rows, setRows] = useState(QUEUE)
  const [at, setAt] = useState(0)
  const [approved, setApproved] = useState(false)

  const judge = (verdict: Row['verdict']) => (i: number) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, verdict } : row)))
  useListKeys({
    count: rows.length,
    index: at,
    onIndexChange: setAt,
    keys: {
      r: judge('right'),
      w: judge('wrong'),
      e: judge('escalated'),
      ' ': (i) => toast(`Evidence for ${rows[i].ref}`),
    },
  })

  useRegisterCommands(
    useMemo(
      () => [
        { id: 'design-toast', label: 'Say hello from the design page', group: 'This page', run: () => toast('Hello') },
      ],
      [],
    ),
  )

  return (
    <>
      <PageHeader title="Tickmark" description="The design language every screen is built from. Sample data only.">
        <SampleChip />
      </PageHeader>

      <div className="flex flex-col gap-8">
        <Section title="Inks, on a quiet grey ground">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {INKS.map((ink) => (
              <div key={ink.name} className="flex flex-col gap-2">
                <div className={cn('flex h-20 items-end rounded-[10px] p-2.5 font-mono text-[11px]', ink.swatch)}>
                  {ink.token}
                </div>
                <b className="text-sm font-semibold">{ink.name}</b>
                <span className="text-ink-soft text-[13px]">{ink.use}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Type</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <span className="text-[28px] font-semibold tracking-[-0.015em]">Inter for the interface</span>
              <span className="text-[26px]">
                <Money amount={1_284_500_000} currency="UGX" />
              </span>
              <span className="font-mono text-sm">run r-0412 · GL 5120 · L 2,218</span>
              <span className="font-serif text-[26px] leading-snug">
                “We noted that 14 payments were released before approval.”
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickmarks</CardTitle>
              <CardDescription>Hollow: {BRAND} proposes. Solid: a person confirmed.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
              {MARKS.map((m) => (
                <div key={m.kind} className="flex items-center gap-3">
                  <Tickmark kind={m.kind} />
                  <Tickmark kind={m.kind} confirmed />
                  <span className="text-[13.5px]">{m.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Tickmark kind="signed" />
                <span className="text-[13.5px]">Signed: only ever solid</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Section title="Buttons and chips">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Approve materiality</Button>
            <Button variant="secondary">Change benchmark</Button>
            <Button variant="graphite">Sign opinion</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button size="sm" variant="secondary">
              Small
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip pressed>All 6</Chip>
            <Chip>Planning 3</Chip>
            <Chip>GA · PM · DO</Chip>
            <SampleChip />
            <Chip tone="vermilion">2 late</Chip>
            <Chip tone="pine">Ties out</Chip>
          </div>
        </Section>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Source chip</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-8">
              Cash paid to Lwera Feeds <Money amount={48_300_000} currency="UGX" />{' '}
              <SourceChip onClick={() => toast('Opens GL 5120 line 2,218')}>GL 5120 · L 2,218</SourceChip>{' '}
              <SourceChip>INV-0417 p.1</SourceChip>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Assertion strip</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <AssertionRow label="Revenue" value={{ E: 'covered', C: 'covered', V: 'planned', Ct: 'covered' }} />
              <AssertionRow label="Payables" value={{ E: 'planned', C: 'covered', Ct: 'planned' }} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Materiality ruler</CardTitle>
            </CardHeader>
            <CardContent>
              <MaterialityRuler
                trivial={9_000_000}
                performance={135_000_000}
                overall={180_000_000}
                misstatements={[{ amount: 104_000_000, label: 'Misstatements so far' }]}
              />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sign line</CardTitle>
            </CardHeader>
            <CardContent>
              <SignLine
                signed={
                  approved ? { by: 'Grace Achieng', at: '31 Oct 2026, 14:02', reason: 'PBT is stable' } : undefined
                }
                actions={
                  <>
                    <Button variant="secondary">Change benchmark</Button>
                    <Button onClick={() => setApproved(true)}>Approve materiality</Button>
                  </>
                }
              >
                {BRAND} suggests 5% of profit before tax: <Money amount={180_000_000} currency="UGX" />. You choose the
                benchmark.
              </SignLine>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Run receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <RunReceipt
                lines={[
                  'run r-0412 · duplicates v3',
                  'ledger sha 9f2c…e1 · 48,213 rows',
                  'model pinned · 41 s · UGX 6,900',
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <Section title="Engagement header and the eight-stage spine">
          <div className="shadow-card overflow-hidden rounded-[18px]">
            <EngagementHeader engagement={demoEngagement} viewing="test" actions={<SampleChip />} />
          </div>
        </Section>

        <Section title="Keyboard first">
          <p className="text-ink-soft text-[13px]">
            <Kbd>⌘K</Kbd> Ask {BRAND} · <Kbd>J</Kbd> <Kbd>K</Kbd> next, previous · <Kbd>R</Kbd> right · <Kbd>W</Kbd>{' '}
            wrong · <Kbd>E</Kbd> escalate · <Kbd>Space</Kbd> evidence
          </p>
          <ul
            aria-label="Sample exception queue"
            className="shadow-card bg-sheet max-w-md overflow-hidden rounded-[18px]"
          >
            {rows.map((row, i) => (
              <li
                key={row.id}
                aria-selected={i === at}
                onClick={() => setAt(i)}
                className={cn(
                  'border-rule-soft flex cursor-pointer items-start gap-2.5 border-b px-3 py-2.5 last:border-b-0',
                  i === at && 'bg-ground shadow-[inset_2px_0_0_var(--ink)]',
                )}
              >
                <Tickmark
                  kind={row.verdict === 'wrong' ? 'agreed' : row.verdict === 'escalated' ? 'query' : 'exception'}
                  confirmed={!!row.verdict}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{row.title}</div>
                  <div className="text-ink-muted text-xs">
                    {row.ref} · <Money amount={row.amount} compact /> {row.verdict && `· ${row.verdict}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-ink-muted text-[13px] font-semibold">{title}</h2>
      {children}
    </section>
  )
}
