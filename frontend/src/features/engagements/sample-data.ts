import type { StageKey } from '@/components/layout/stages'
import { BRAND } from '@/lib/brand'

// Sample data from the design boards (Kagera Dairies and the other invented clients).
// Every name and figure is invented. Replace with API queries once the backend serves these.

export type Mark = 'agreed' | 'traced' | 'footed' | 'exception' | 'query' | 'signed' | 'workpaper' | 'plan'

export const KAGERA = 'Kagera Dairies Ltd'

/* ---------- 10 · Engagements (home) ---------- */

// Queue items name their client; the home screen links each one to that client's engagement when it exists.
type Target = StageKey | 'exceptions' | 'workpapers' | 'requests'

export type QueueItem = {
  mark: Mark
  glyph: string
  title: string
  detail: string
  client: string
  to: Target
  when?: string
  primary?: string
}

export const WAITING_ON_YOU: QueueItem[] = [
  {
    mark: 'exception',
    glyph: '✕',
    title: '11 exceptions to judge',
    detail: 'Kagera Dairies · duplicates, unapproved payments',
    client: KAGERA,
    to: 'exceptions',
    primary: 'Start triage',
  },
  {
    mark: 'workpaper',
    glyph: 'W',
    title: '2 workpapers to review',
    detail: 'Kagera Dairies · payables, revenue cut-off',
    client: KAGERA,
    to: 'workpapers',
    when: 'Today',
  },
  {
    mark: 'plan',
    glyph: '5',
    title: 'Approve the audit plan',
    detail: `Mbarara Transit · ${BRAND} drafted it yesterday`,
    client: 'Mbarara Transit Co',
    to: 'risk',
    when: 'Fri',
  },
  {
    mark: 'signed',
    glyph: 'S',
    title: 'Opinion ready for partner',
    detail: 'Lake Victoria Agro · D. Okello to sign',
    client: 'Lake Victoria Agro-Processors',
    to: 'report',
    when: '7 Nov',
  },
]

export type ClientWait = {
  title: string
  detail: string
  amount?: string
  client: string
  to: Target
  when?: string
  late?: string
}

export const WAITING_ON_CLIENTS: ClientWait[] = [
  {
    title: '7 requests open, 2 overdue',
    detail: 'Kagera Dairies · invoices, board minutes',
    client: KAGERA,
    to: 'requests',
    late: '2 late',
  },
  {
    title: "Books don't tie out",
    detail: 'Rwenzori Health Trust · bank differs by',
    amount: 'UGX 3.2m',
    client: 'Rwenzori Health Trust',
    to: 'connect',
    when: '3 days',
  },
  {
    title: 'Engagement letter unsigned',
    detail: 'Gulu Hardware · sent 28 Oct',
    client: 'Gulu Hardware and Building Supplies',
    to: 'accept',
    when: 'Mon',
  },
]

// The queues show the top items; these are the full counts.
export const WAITING_COUNTS = { mine: 9, theirs: 3 }

/**
 * What the backend does not track yet for each engagement: the stage within its phase, open exceptions,
 * materiality, misstatements against performance materiality, and the due date. Keyed by client name.
 */
export type EngagementExtras = {
  kind: string
  stage: StageKey
  exceptions: number | null
  materiality: string | null
  misstatements:
    | { kind: 'bar'; used: number; of: number; pct: number; tone: 'exception' | 'agreed' }
    | { kind: 'text'; text: string; tone?: 'client' }
  due: string
}

export const ENGAGEMENT_EXTRAS: Record<string, EngagementExtras> = {
  [KAGERA]: {
    kind: 'Statutory · IFRS for SMEs',
    stage: 'test',
    exceptions: 11,
    materiality: '180.0m',
    misstatements: { kind: 'bar', used: 104, of: 135, pct: 77, tone: 'exception' },
    due: '30 Nov',
  },
  'Mbarara Transit Co': {
    kind: 'Statutory · IFRS',
    stage: 'risk',
    exceptions: null,
    materiality: '95.0m',
    misstatements: { kind: 'text', text: 'Not tested yet' },
    due: '15 Dec',
  },
  'Lake Victoria Agro-Processors': {
    kind: 'Statutory · IFRS',
    stage: 'report',
    exceptions: 0,
    materiality: '240.0m',
    misstatements: { kind: 'bar', used: 41, of: 180, pct: 23, tone: 'agreed' },
    due: '7 Nov',
  },
  'Rwenzori Health Trust': {
    kind: 'Donor-funded NGO · IPSAS',
    stage: 'connect',
    exceptions: null,
    materiality: '22.0m',
    misstatements: { kind: 'text', text: 'Tie-out blocked', tone: 'client' },
    due: '20 Dec',
  },
  'Entebbe Fresh Exports': {
    kind: 'Statutory · IFRS for SMEs',
    stage: 'understand',
    exceptions: null,
    materiality: null,
    misstatements: { kind: 'text', text: 'Not tested yet' },
    due: '31 Jan',
  },
  'Gulu Hardware and Building Supplies': {
    kind: 'Statutory · IFRS for SMEs',
    stage: 'accept',
    exceptions: null,
    materiality: null,
    misstatements: { kind: 'text', text: 'Not tested yet' },
    due: '28 Feb',
  },
}

/* ---------- 11 · Accept the client ---------- */

export type Check = {
  mark: Mark
  title: string
  rest?: string
  amount?: string
  restAfter?: string
  note?: string
  sources: string[]
  tail?: string
}

export const ACCEPT_RUN = 'run r-0388 · 30 Oct 2026, 09:14 · 2 min'

export const ACCEPT_CHECKS: Check[] = [
  {
    mark: 'agreed',
    title: 'No sanctions match',
    rest: ' for the company, 3 directors and 2 shareholders',
    note: 'UN, OFAC, EU and UK lists as of 30 Oct 2026',
    sources: ['screen-0388.json'],
  },
  {
    mark: 'traced',
    title: 'Owners and directors traced',
    rest: ' to the registry filing',
    sources: ['URSB annual return 2025 p.2'],
  },
  {
    mark: 'exception',
    title: 'Related party: director J. Mugisha also directs Lwera Feeds Ltd',
    rest: ', which received ',
    amount: 'UGX 1.84bn',
    restAfter: ' in payments last year',
    sources: ['URSB Lwera Feeds p.1', 'Prior FS note 21'],
    tail: 'Carried to risk assessment as a significant risk',
  },
  {
    mark: 'agreed',
    title: 'Team declared independent',
    rest: ': no shares, loans or family ties',
    sources: ['Declarations 3 of 3'],
  },
  {
    mark: 'footed',
    title: 'Fee is 2.1% of firm revenue',
    rest: ', under the 15% dependence limit',
    sources: ['Fee proposal v2'],
  },
  {
    mark: 'query',
    title: 'Prior auditor clearance not yet received',
    note: `Requested 24 Oct from [Prior auditor] · ${BRAND} will chase on Monday`,
    sources: [],
  },
  {
    mark: 'agreed',
    title: '1 news article found',
    rest: ', about a late tax filing in 2024, settled',
    sources: ['[News source], 12 Mar 2024'],
  },
]

/* ---------- 12 · Connect books and tie out ---------- */

export type Source = {
  icon: string
  name: string
  detail: string
  count?: string
  countAfter?: string
  mark: 'signed-agreed' | 'query' | 'requested'
}

export const SOURCES: Source[] = [
  {
    icon: 'QB',
    name: 'General ledger',
    detail: 'QuickBooks export · ',
    count: '48,213',
    countAfter: ' lines · Jul 2025 to Jun 2026',
    mark: 'signed-agreed',
  },
  {
    icon: 'XL',
    name: 'Trial balance',
    detail: 'Excel · ',
    count: '214',
    countAfter: ' accounts',
    mark: 'signed-agreed',
  },
  {
    icon: 'PDF',
    name: 'Stanbic current ··4471',
    detail: '12 statements · read with OCR · ',
    count: '3,118',
    countAfter: ' lines',
    mark: 'signed-agreed',
  },
  {
    icon: 'PDF',
    name: 'Centenary collections ··0918',
    detail: '12 statements · ',
    count: '1,402',
    countAfter: ' lines',
    mark: 'signed-agreed',
  },
  { icon: 'DIR', name: 'Sales invoices', detail: '', count: '3,904', countAfter: ' PDFs', mark: 'signed-agreed' },
  {
    icon: 'DIR',
    name: 'Purchase invoices',
    detail: '',
    count: '2,611',
    countAfter: ' PDFs and phone scans · 37 unreadable',
    mark: 'query',
  },
  {
    icon: 'XL',
    name: 'Payroll register',
    detail: 'Excel · 12 months · ',
    count: '186',
    countAfter: ' staff',
    mark: 'signed-agreed',
  },
  { icon: '?', name: 'Fixed asset register', detail: 'Requested from client 22 Oct', mark: 'requested' },
]

export type TieOut = {
  mark: Mark
  check: string
  source?: string
  note?: string
  noteAmount?: string
  noteAfter?: string
  books: string
  other: string
  diff: string
  diffTone?: 'agreed' | 'exception'
  items?: { text: string; source: string; amount: string }[]
}

export const TIE_OUTS: TieOut[] = [
  {
    mark: 'footed',
    check: 'Trial balance debits equal credits',
    books: '38,412,906,120',
    other: '38,412,906,120',
    diff: '0',
    diffTone: 'agreed',
  },
  {
    mark: 'footed',
    check: 'Ledger rolls up to the trial balance',
    note: '214 of 214 accounts',
    books: '214',
    other: '214',
    diff: '0',
    diffTone: 'agreed',
  },
  {
    mark: 'traced',
    check: "Opening balances equal last year's audited closing",
    source: 'FY25 FS p.6',
    books: '9,880,114,000',
    other: '9,880,114,000',
    diff: '0',
    diffTone: 'agreed',
  },
  {
    mark: 'traced',
    check: 'Stanbic ··4471: ledger to statement at 30 Jun',
    source: 'Stmt Jun p.4',
    books: '1,204,880,300',
    other: '1,204,880,300',
    diff: '0',
    diffTone: 'agreed',
  },
  {
    mark: 'exception',
    check: 'Centenary ··0918: ledger to statement',
    source: 'Stmt Jun p.2',
    books: '412,550,000',
    other: '409,350,000',
    diff: '3,200,000',
    diffTone: 'exception',
    items: [
      { text: 'Cheque 000412 to Mbale Packaging, not yet cleared', source: 'GL 2105 · L 9,331', amount: '2,000,000' },
      { text: 'June bank charges not posted to the ledger', source: 'Stmt Jun p.2 L 41', amount: '1,200,000' },
    ],
  },
  {
    mark: 'footed',
    check: 'Revenue in ledger to sales invoices',
    note: 'Within tolerance of ',
    noteAmount: 'UGX 9m',
    noteAfter: ', the clearly trivial level',
    books: '12,412,300,000',
    other: '12,406,900,000',
    diff: '5,400,000',
  },
]

/* ---------- 13 · Folder and compliance review ---------- */

export type ControlArea = { name: string; files: number; covered: number | null; short?: boolean }

export const CONTROL_AREAS: ControlArea[] = [
  { name: 'Purchasing and payments', files: 412, covered: 96 },
  { name: 'Revenue and receivables', files: 298, covered: 100 },
  { name: 'Cash and bank', files: 146, covered: 100 },
  { name: 'Payroll', files: 131, covered: 100 },
  { name: 'Governance', files: 48, covered: 70, short: true },
  { name: 'Fixed assets', files: 22, covered: 40, short: true },
  { name: 'Tax compliance', files: 96, covered: 100 },
  { name: 'Related parties', files: 11, covered: 100 },
  { name: 'IT and access', files: 9, covered: 100 },
  { name: 'Not audit-relevant', files: 111, covered: null },
]

export type Expected = {
  mark: Mark
  expected: string
  found: string
  amount?: string
  foundAfter?: string
  sources: string[]
  tone?: 'exception' | 'client'
  ellipsis?: boolean
}

// The boards show the Governance area; other areas have no detail yet.
export const GOVERNANCE: Expected[] = [
  {
    mark: 'agreed',
    expected: 'Board minutes, monthly',
    found: '9 of 12 months ',
    sources: ['minutes_2025-07.pdf'],
    ellipsis: true,
  },
  {
    mark: 'exception',
    expected: 'Board minutes: Feb, Mar, Apr 2026',
    found: 'Missing. The ledger shows a ',
    amount: 'UGX 1.2bn',
    foundAfter: ' loan drawn in March ',
    sources: ['GL 2400 · L 12,880'],
    tone: 'exception',
  },
  { mark: 'agreed', expected: 'Approval limits policy', found: '', sources: ['Finance policy v4 p.3'] },
  { mark: 'agreed', expected: 'Shareholder register', found: '', sources: ['URSB return 2025 p.2'] },
  {
    mark: 'agreed',
    expected: 'Conflict of interest declarations',
    found: '2 of 3 directors ',
    sources: ['COI_2026.pdf'],
  },
  {
    mark: 'exception',
    expected: "J. Mugisha's declaration",
    found: 'Missing. He also directs Lwera Feeds, a supplier',
    sources: [],
    tone: 'exception',
  },
  {
    mark: 'query',
    expected: 'Loan agreement for the March drawdown',
    found: 'Asked the client on 29 Oct',
    sources: [],
    tone: 'client',
  },
]

export const APPROVAL_TIERS = [
  { band: 'under 5m', who: 'Finance manager' },
  { band: '5m to 50m', who: 'Finance manager and GM' },
  { band: 'over 50m', who: 'Board resolution' },
]

/* ---------- 14 · Set materiality ---------- */

export type Benchmark = {
  id: string
  label: string
  base: string
  baseAmount?: string
  sources: string[]
  extra?: string
  value: string
  suggested?: boolean
  overall: number
}

export const BENCHMARKS: Benchmark[] = [
  {
    id: 'pbt',
    label: '5% of profit before tax',
    base: 'PBT ',
    baseAmount: '3,600m',
    sources: ['TB · draft FS p.2'],
    extra: ' · steady for 3 years: 3,050m, 3,310m, 3,600m',
    value: '180.0m',
    suggested: true,
    overall: 180_000_000,
  },
  {
    id: 'revenue',
    label: '1% of revenue',
    base: 'Revenue ',
    baseAmount: '12,412m',
    sources: ['TB 4000–4090'],
    value: '124.1m',
    overall: 124_120_000,
  },
  {
    id: 'assets',
    label: '1.5% of total assets',
    base: 'Assets ',
    baseAmount: '21,050m',
    sources: ['TB 1000–1990'],
    value: '315.8m',
    overall: 315_750_000,
  },
  {
    id: 'prior',
    label: "Last year's level",
    base: 'Set by the prior auditor ',
    sources: ['Clearance letter p.2'],
    value: '160.0m',
    overall: 160_000_000,
  },
]

export const PERFORMANCE_SHARES = [50, 60, 75] as const
export const TRIVIAL_SHARES = [3, 5] as const
export const SPECIFIC = { label: 'Specific: related-party payments to Lwera Feeds', amount: 50_000_000 }
