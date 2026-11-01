import { BRAND } from '@/lib/brand'

// Sample data for the Test stage, copied from the design boards (Kagera Dairies, an invented client).
// It stands in for the API until the backend serves runs, tests, exceptions and workpapers.

export type Mark = 'agreed' | 'query' | 'exception' | 'footed'

export const SAMPLE = {
  client: 'Kagera Dairies Ltd',
  period: 'FY 2025/26',
  kind: 'Statutory',
  framework: 'IFRS for SMEs',
  team: 'GA · PM · DO',
}

export const TEST_TAB_COUNTS = { tests: 12, exceptions: 37, workpapers: 9, requests: 7 }

/* Analytics: statement and model review */

export type Source = { label: string }

export type StatementLine = {
  mark: Mark
  line: string
  fy26: string
  fy25: string
  change: string
  /** Explanation as text and source chips, in reading order. */
  explanation: (string | Source)[]
  unexplained?: string
}

export const STATEMENT_LINES: StatementLine[] = [
  {
    mark: 'agreed',
    line: 'Revenue',
    fy26: '12,412',
    fy25: '10,980',
    change: '+13.0%',
    explanation: [
      'Litres sold up 9% ',
      { label: 'Dispatch register' },
      ', price up 4% ',
      { label: 'Price list Jan 26' },
      '. Explains 12.9 of 13.0 points',
    ],
  },
  {
    mark: 'query',
    line: 'Cost of sales',
    fy26: '7,940',
    fy25: '6,820',
    change: '+16.4%',
    explanation: [
      'Grows faster than revenue: margin 36.0% from 37.9%. Milk price rose 6% ',
      { label: 'Farmer rate card' },
      '; 1.4 points unexplained',
    ],
  },
  {
    mark: 'agreed',
    line: 'Finance costs',
    fy26: '210',
    fy25: '95',
    change: '+121%',
    explanation: [
      'New 1.2bn loan from March at 17% ',
      { label: 'GL 2400' },
      ' ',
      { label: 'Loan schedule' },
      '. Expected 68m, recorded 71m',
    ],
  },
  {
    mark: 'exception',
    line: 'Trade receivables',
    fy26: '2,480',
    fy25: '1,640',
    change: '+51.2%',
    explanation: ['Days to collect rose to 73 from 55. Driven by June sales of 2,100m, 2.2 times a normal month. '],
    unexplained: 'Not explained by the business.',
  },
  {
    mark: 'agreed',
    line: 'Inventory',
    fy26: '2,140',
    fy25: '1,980',
    change: '+8.1%',
    explanation: ['In line with volume'],
  },
  {
    mark: 'agreed',
    line: 'Admin expenses',
    fy26: '1,310',
    fy25: '1,290',
    change: '+1.6%',
    explanation: ['Flat, as budgeted ', { label: 'Budget FY26' }],
  },
]

/** Revenue by month, UGX m, July 2025 to June 2026. Sums to the 12,412 on the statement. */
export const MONTHLY_REVENUE = [860, 885, 905, 960, 985, 985, 935, 905, 940, 975, 977, 2100]

/** A formula shown on its own line (`block`) or inline before the detail. */
export type ModelFinding = { mark: Mark; title: string; formula?: string; block?: boolean; detail: (string | Source)[] }

export const MODEL = {
  file: 'Cash flow forecast v7',
  meta: 'Going-concern support · 6 sheets · 1,940 formulas',
  findings: [
    {
      mark: 'exception',
      title: 'Hard-coded plug in a formula',
      formula: 'Forecast!C14 = B14*1.12+250000000',
      block: true,
      detail: ['Adds 250m of cash with no label'],
    },
    {
      mark: 'exception',
      title: 'Total skips a row',
      formula: 'Summary!F40 = SUM(F12:F39)',
      detail: [', row 41 holds loan repayments of 300m'],
    },
    {
      mark: 'query',
      title: 'Growth assumption of 18%',
      detail: ['History is 9 to 13% ', { label: 'FY24 to FY26 FS' }, '. Ask management for support'],
    },
    { mark: 'footed', title: '1,937 other formulas recomputed', detail: ['No differences'] },
  ] satisfies ModelFinding[],
}

/* Tests: full-population tests */

export type PopulationTest = {
  name: string
  note?: string
  assertion: string
  tested: number
  found: number
  value?: string
  /** Undefined for signals, which only feed the risk score. */
  catchRate?: string
  signal?: boolean
}

export const TESTS: PopulationTest[] = [
  {
    name: 'Three-way match',
    note: 'payment, invoice, GRN',
    assertion: 'E',
    tested: 6120,
    found: 13,
    value: '312.4m',
    catchRate: '96% · 1.2 false per 1,000',
  },
  {
    name: 'Approval limits',
    note: 'policy v4',
    assertion: 'E, P',
    tested: 6120,
    found: 14,
    value: '1,104.0m',
    catchRate: '99% · 0.3 false per 1,000',
  },
  {
    name: 'Duplicate payments',
    assertion: 'E',
    tested: 6120,
    found: 4,
    value: '38.2m',
    catchRate: '98% · 0.8 false per 1,000',
  },
  {
    name: 'Journals by unusual users',
    assertion: 'All',
    tested: 1906,
    found: 3,
    value: '96.0m',
    catchRate: '91% · 2.0 false per 1,000',
  },
  {
    name: 'Revenue cut-off',
    note: '15 days each side',
    assertion: 'Ct',
    tested: 712,
    found: 2,
    value: '41.0m',
    catchRate: '94% · 1.5 false per 1,000',
  },
  {
    name: 'Vendor and staff share a bank account',
    assertion: 'E',
    tested: 598,
    found: 1,
    value: '18.6m',
    catchRate: '100% · 0 false per 1,000',
  },
  { name: 'Payments with no invoice', assertion: 'E', tested: 6120, found: 0, catchRate: '97% · 0.5 false per 1,000' },
  {
    name: 'Split payments under a limit',
    assertion: 'E, P',
    tested: 6120,
    found: 0,
    catchRate: '89% · 2.6 false per 1,000',
  },
  { name: 'Ghost workers', assertion: 'E', tested: 186, found: 0, catchRate: '95% · 0 false per 1,000' },
  { name: 'Round-sum payments', note: 'signal', assertion: '–', tested: 6120, found: 22, signal: true },
  { name: 'Weekend postings', note: 'signal', assertion: '–', tested: 48213, found: 41, signal: true },
  { name: 'Benford, first digit', note: 'signal', assertion: '–', tested: 6120, found: 1, signal: true },
]

export const TEST_RUN = { ledger: 'sha 9f2c…e1', run: 'run r-0401' }

/** First-digit shares in percent: Benford's expected curve and Kagera's 6,120 invoices. */
export const BENFORD = {
  invoices: 6120,
  expected: [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6],
  actual: [28.4, 17.0, 12.2, 12.6, 7.6, 6.2, 5.6, 5.4, 5.4],
  /** Digit that stands out, 1-based. */
  outlier: 4,
}

/* Exceptions: triage */

export type Judgment = 'right' | 'wrong' | 'escalate' | 'ask'

export type QueueItem = {
  id: string
  title: string
  ref: string
  amount: string
  test: string
}

export const OPEN_EXCEPTIONS: QueueItem[] = [
  { id: 'PV-0611', title: 'Lwera Feeds · no goods note', ref: 'PV-0611', amount: '96.0m', test: '3-way' },
  { id: 'PV-0588', title: 'Lwera Feeds · over limit, no note', ref: 'PV-0588', amount: '72.5m', test: '3-way' },
  { id: 'PV-0533', title: 'Nile Fuel · GM approved alone', ref: 'PV-0533', amount: '61.0m', test: 'limits' },
  { id: 'JE-1906', title: 'Journal by GM on a Sunday', ref: 'JE-1906', amount: '40.0m', test: 'journals' },
  { id: 'INV-S-7781', title: 'Delivered 3 Jul, booked 29 Jun', ref: 'INV-S-7781', amount: '24.0m', test: 'cut-off' },
  { id: '412', title: 'Okot Transport shares a staff account', ref: '412', amount: '18.6m', test: 'bank overlap' },
  { id: 'INV-2231', title: 'Mbale Packaging paid twice', ref: 'INV-2231', amount: '9.4m', test: 'duplicates' },
]

/** Open exceptions past the ones listed, and those judged before today. */
export const MORE_OPEN = 4
export const JUDGED_EARLIER = 24

export type JudgedItem = { title: string; ref: string; judgment: Judgment; note?: string; by: string }

export const JUDGED_TODAY: JudgedItem[] = [
  { title: 'Lwera Feeds · no goods note', ref: 'PV-0412', judgment: 'right', by: 'GA' },
  { title: 'Mbale Packaging · duplicate?', ref: 'INV-2190', judgment: 'wrong', note: 'credit note found', by: 'GA' },
]

/** The evidence the assistant gathered for the exception shown on the board. */
export const EXCEPTION_DETAIL = {
  id: 'PV-0611',
  ref: 'PV-2026-0611',
  test: 'Three-way match',
  assertion: 'existence',
  headline: [
    'Lwera Feeds was paid ',
    'UGX 96,000,000',
    ' for 1,600 bags of maize bran. No goods received note exists for them.',
  ],
  summary: `${BRAND} searched all 209 goods received notes from 15 June to 31 July. None mentions Lwera Feeds or 1,600 bags. The payment was approved by the GM alone, above the 50m board limit. Lwera Feeds is a related party.`,
  ledger: {
    source: 'GL 5120 · L 2,218',
    rows: [
      ['Date', '28 Jun 2026'],
      ['Account', '5120 Feed purchases'],
      ['Payee', 'LWERA FEEDS'],
      ['Amount', '96,000,000'],
      ['Approved by', 'A. Kato, GM'],
    ] as [string, string][],
    flag: ['Board resolution', 'none found'] as [string, string],
  },
  bank: {
    source: 'Stanbic Jun p.4 L 18',
    before: '28/06  TRF LWERA FEEDS LTD\n       ',
    marked: '96,000,000.00 DR',
    after: '  bal 1,311,0..',
  },
  invoice: {
    title: 'Invoice INV-0417',
    source: 'p.1 of 1 · open PDF',
    before:
      'LWERA FEEDS LTD\nPlot 14, Lwera, Mpigi\nTAX INVOICE   No. 0417\nDate: 24 June 2026\nTo: Kagera Dairies Ltd\n\n',
    marked: 'Maize bran, 50 kg bags   1,600\nUnit price             60,000\nTotal UGX          96,000,000',
    after: '\n\nDelivery: to Mbarara store\nReceived by: ____________',
  },
  grns: {
    source: '209 files searched',
    rows: [
      ['GRN-1240 · 26 Jun · Kiboga Millers', '800 bags'],
      ['GRN-1241 · 27 Jun · Nile Fuel', '12,000 l'],
      ['GRN-1242 · 1 Jul · Kiboga Millers', '600 bags'],
    ] as [string, string][],
    missing: 'No note for Lwera Feeds, 15 Jun to 31 Jul',
    query: 'Query: vendor ∈ 3 Lwera spellings, date ±30 days, qty 1,600',
    run: 'r-0402',
  },
}

/* Workpapers */

export type PaperState = 'signed' | 'reviewed' | 'drafted' | 'not-started'

export const WORKPAPERS: { code: string; title: string; state: PaperState }[] = [
  { code: 'A', title: 'Planning', state: 'signed' },
  { code: 'B', title: 'Materiality', state: 'signed' },
  { code: 'C-1', title: 'Revenue', state: 'reviewed' },
  { code: 'C-2', title: 'Revenue cut-off', state: 'drafted' },
  { code: 'C-3', title: 'Purchases, Lwera Feeds', state: 'drafted' },
  { code: 'C-4', title: 'Approval limits', state: 'drafted' },
  { code: 'D', title: 'Inventory', state: 'not-started' },
  { code: 'E', title: 'Borrowings', state: 'not-started' },
  { code: 'F', title: 'Journals', state: 'not-started' },
]

export const WORKPAPER_C3 = {
  code: 'WP C-3',
  run: 'r-0402',
  judged: 13,
  title: 'Purchases from Lwera Feeds Ltd: payment, invoice and goods received',
  objective:
    'To confirm that payments to Lwera Feeds, a related party, were for goods actually received and properly approved. Assertions: existence and presentation.',
  results: [
    { result: 'Fully matched', payments: 201, ugx: '1,528,200,000', tone: 'plain' },
    { result: 'No goods received note', payments: 8, ugx: '312,400,000', tone: 'exception' },
    { result: 'Fewer bags received than invoiced', payments: 5, ugx: '23,600,000 short', tone: 'client' },
  ] as const,
  signoffs: [
    { who: `Prepared by ${BRAND}`, when: '30 Oct, 23:12 · r-0402', state: 'done' },
    { who: 'Reviewed by Grace A., manager', when: 'Waiting', state: 'waiting' },
    { who: 'Approved by D. Okello, partner', when: 'After review', state: 'waiting' },
  ] as const,
  comments: [
    {
      who: 'Peter M.',
      initials: 'PM',
      role: 'Senior · 1h',
      text: 'Could the goods have arrived in early August? Check after 31 July.',
    },
    {
      who: BRAND,
      initials: BRAND[0],
      role: '40 min',
      text: 'Searched to 30 September: no Lwera note for 1,600 bags. Added to the paragraph above.',
      source: 'r-0407',
    },
  ],
  sources: { checked: 14, total: 14 },
}
