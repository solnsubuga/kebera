// Sample data for Kagera Dairies' misstatement summary, taken from the design board, until the API exists.

export const MATERIALITY = { trivial: 9_000_000, performance: 135_000_000, overall: 180_000_000 }

export type MisstatementKind = 'Factual' | 'Judgmental' | 'Projected'
export type MisstatementStatus = 'uncorrected' | 'corrected' | 'trivial'

export type Misstatement = {
  id: string
  title: string
  detail?: string
  kind: MisstatementKind
  status: MisstatementStatus
  /** The status line as the reviewer recorded it. */
  statusText: string
  amount: number
  evidence: string[]
}

export const MISSTATEMENTS: Misstatement[] = [
  {
    id: 'm1',
    title: 'Sale delivered 3 July booked in June',
    detail: 'Overstates revenue and receivables',
    kind: 'Factual',
    status: 'uncorrected',
    statusText: 'Uncorrected · management declined',
    amount: 24_000_000,
    evidence: ['INV-S-7781', 'DN 3 Jul'],
  },
  {
    id: 'm2',
    title: 'No provision for expiring milk powder',
    detail: "kebera's expiry analysis; management estimate differs",
    kind: 'Judgmental',
    status: 'uncorrected',
    statusText: 'Uncorrected',
    amount: 38_000_000,
    evidence: ['Stock ageing r-0410'],
  },
  {
    id: 'm3',
    title: 'Inventory count differences, projected to all stores',
    detail: '4.1m found in 3 of 9 stores, projected by value',
    kind: 'Projected',
    status: 'uncorrected',
    statusText: 'Uncorrected',
    amount: 42_200_000,
    evidence: ['Count sheets', 'Projection calc'],
  },
  {
    id: 'm4',
    title: 'Lwera Feeds payment with no delivery proof',
    detail: 'Client proved delivery for 7 of 8; PV-0611 reversed',
    kind: 'Factual',
    status: 'corrected',
    statusText: 'Corrected · AJE-04',
    amount: 96_000_000,
    evidence: ['WP C-3', 'AJE-04'],
  },
  {
    id: 'm5',
    title: 'Mbale Packaging invoice paid twice',
    kind: 'Factual',
    status: 'corrected',
    statusText: 'Corrected · refund booked',
    amount: 9_400_000,
    evidence: ['INV-2231', 'AJE-05'],
  },
  {
    id: 'm6',
    title: 'June bank charges not posted',
    kind: 'Factual',
    status: 'trivial',
    statusText: 'Below trivial',
    amount: 1_200_000,
    evidence: ['Stmt Jun p.2'],
  },
]

export const EXCEPTIONS = { judged: 37, total: 37, right: 29, wrong: 8 }

/** 104,200,000 -> "104.2m"; whole millions drop the decimal (180,000,000 -> "180m"). */
export function short(n: number) {
  const m = n / 1_000_000
  return `${Number.isInteger(m) ? m : m.toFixed(1)}m`
}
