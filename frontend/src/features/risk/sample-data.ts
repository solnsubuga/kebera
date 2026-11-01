// Sample data for the Kagera Dairies illustration (board 15). All names and figures are invented.
// Replace with the API once the risk matrix has a backend.

export type Assertion = 'E' | 'C' | 'R' | 'V' | 'Ct' | 'P'
export const ASSERTIONS: Assertion[] = ['E', 'C', 'R', 'V', 'Ct', 'P']

/** How hard a risk hits an assertion. Missing means not affected. */
export type Hit = 'H' | 'M'

export type Rating = 'significant' | 'elevated' | 'normal'
export const RATING_LABEL: Record<Rating, string> = {
  significant: 'Significant',
  elevated: 'Elevated',
  normal: 'Normal',
}

export interface Source {
  label: string
}

export interface RiskArea {
  id: string
  area: string
  note: string
  source?: Source
  /** Balance in UGX millions. */
  balanceM: number
  /** laba's 0 to 100 score: where to look first, not evidence. */
  score: number
  hits: Partial<Record<Assertion, Hit>>
  response: string
  /** What laba proposes when the auditor accepts its ratings. */
  suggested: Rating
  /** The auditor's rating. Undefined until a person chooses. */
  rating?: Rating
}

export const RISK_AREAS: RiskArea[] = [
  {
    id: 'revenue',
    area: 'Revenue',
    note: 'Presumed fraud risk · 38% of Q4 sales in June',
    source: { label: 'GL 4000' },
    balanceM: 12412,
    score: 82,
    hits: { E: 'H', V: 'M', Ct: 'H' },
    response: 'Every invoice to a delivery note; cut-off 15 days each side',
    suggested: 'significant',
    rating: 'significant',
  },
  {
    id: 'payables',
    area: 'Purchases and payables',
    note: 'Related party Lwera Feeds · 14 payments over limit',
    source: { label: 'Folder · Finance policy' },
    balanceM: 4920,
    score: 77,
    hits: { E: 'H', C: 'M', V: 'M', P: 'M' },
    response: 'Duplicates, approvals, vendor-employee overlap on all payments',
    suggested: 'significant',
    rating: 'significant',
  },
  {
    id: 'inventory',
    area: 'Inventory',
    note: 'Perishable · no count sheets yet',
    source: { label: 'TB 1300' },
    balanceM: 2140,
    score: 61,
    hits: { E: 'H', V: 'H' },
    response: 'Attend count; expiry analysis on stock lines',
    suggested: 'elevated',
    rating: 'elevated',
  },
  {
    id: 'borrowings',
    area: 'Borrowings',
    note: 'New 1.2bn loan in March · minutes missing',
    source: { label: 'GL 2400' },
    balanceM: 1200,
    score: 58,
    hits: { C: 'H', R: 'M', P: 'M' },
    response: 'Bank confirmation; loan agreement to ledger',
    suggested: 'elevated',
  },
  {
    id: 'payroll',
    area: 'Payroll',
    note: '186 staff · casual workers paid in cash',
    source: { label: 'Payroll register' },
    balanceM: 2810,
    score: 44,
    hits: { E: 'M' },
    response: 'Ghost-worker check: staff bank accounts and IDs',
    suggested: 'normal',
  },
  {
    id: 'cash',
    area: 'Cash and bank',
    note: 'Reconciles, 2 items logged',
    balanceM: 1617,
    score: 35,
    hits: { E: 'M' },
    response: 'Bank confirmations',
    suggested: 'normal',
  },
  {
    id: 'ppe',
    area: 'Property and equipment',
    note: 'Register missing · few additions',
    balanceM: 6300,
    score: 30,
    hits: { V: 'M' },
    response: 'Additions over 9m to invoice',
    suggested: 'normal',
  },
]

export interface FraudRisk {
  id: string
  title: string
  detail: string
  source: Source
}

export const FRAUD_RISKS: FraudRisk[] = [
  {
    id: 'override',
    title: 'Management override',
    detail: ', presumed in every audit. 212 manual journals by the GM, 41 posted on weekends',
    source: { label: 'JE profile r-0396' },
  },
  {
    id: 'revenue',
    title: 'Revenue recognition',
    detail: ', presumed. June spike of 2.1bn against a 0.9bn monthly average',
    source: { label: 'GL 4000' },
  },
  {
    id: 'related-party',
    title: 'Related-party supplier',
    detail: '. Director J. Mugisha also directs Lwera Feeds; declaration missing',
    source: { label: 'Accept r-0388' },
  },
]

export const BRAINSTORM = {
  text: 'Team brainstorm recorded 28 Oct with GA, PM and DO',
  source: { label: 'Meeting note' },
}
