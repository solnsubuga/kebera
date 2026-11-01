import type { Engagement } from '@/features/engagements/types'
import { BRAND } from '@/lib/brand'

// Sample run for "Ask laba" (board 20): Kagera Dairies, Lwera Feeds three-way match.
// All names and figures are invented.

export type StepState = 'done' | 'running' | 'queued'

export interface RunStep {
  title: string
  detail: string
  source?: string
  state: StepState
}

export interface Finding {
  payment: string
  date: string
  amountUgx: number
  found: string
  sources: string[]
}

export const SAMPLE_RUN = {
  question: 'Find every payment to Lwera Feeds that has no goods received note',
  scope: 'Scope: this engagement',
  steps: [
    { title: 'Pick the test', detail: 'Three-way match: payment, invoice, goods received note', state: 'done' },
    {
      title: 'Find Lwera Feeds everywhere',
      detail: '3 spellings joined: “Lwera Feeds Ltd”, “LWERA FEEDS”, “Lwera Feed Supplies”',
      source: 'vendor match r-0402',
      state: 'done',
    },
    { title: 'Match 214 payments to invoices', detail: 'In code, by amount, date and reference', state: 'done' },
    { title: 'Match invoices to GRNs', detail: 'Read 209 scanned notes with OCR', state: 'done' },
    {
      title: 'Re-open every cited page',
      detail: `Checks each quote exists where ${BRAND} says · 11 of 13`,
      state: 'running',
    },
    { title: 'Draft a workpaper section', detail: 'Waits for you to judge the exceptions', state: 'queued' },
  ] satisfies RunStep[],
  findings: [
    {
      payment: 'PV-2026-0611',
      date: '28 Jun 2026',
      amountUgx: 96_000_000,
      found: 'No GRN; paid 2 days before year end',
      sources: ['GL 5120 L 2,218', 'INV-0417'],
    },
    {
      payment: 'PV-2026-0588',
      date: '14 Jun 2026',
      amountUgx: 72_500_000,
      found: 'No GRN; approved by GM alone, over 50m limit',
      sources: ['GL 5120 L 2,160', 'INV-0409'],
    },
    {
      payment: 'PV-2026-0412',
      date: '22 Apr 2026',
      amountUgx: 48_300_000,
      found: 'No GRN',
      sources: ['GL 5120 L 1,744', 'INV-0362'],
    },
    {
      payment: 'PV-2026-0390',
      date: '11 Apr 2026',
      amountUgx: 31_200_000,
      found: 'GRN for 400 bags, invoice for 520',
      sources: ['GRN-1187 p.1', 'INV-0355'],
    },
  ] satisfies Finding[],
  totalFindings: 13,
  receipt: [
    { label: 'Run', value: 'r-0402', code: true },
    { label: 'Ledger', value: 'sha 9f2c…e1', code: true },
    { label: 'Documents', value: '423 files' },
    { label: 'Test version', value: '3way-match v3', code: true },
    { label: 'Model', value: '[pinned]', code: true },
    { label: 'Time', value: '2 min 41 s' },
    { label: 'Cost', value: 'UGX 6,900', figure: true },
  ],
  receiptNote: 'Arithmetic and matching ran in code. The model read the scans and wrote the summary.',
}

/** The engagement the sample run belongs to. */
export const SAMPLE_ENGAGEMENT = {
  id: 'kagera',
  client_name: 'Kagera Dairies Ltd',
  period_end: '2026-06-30',
  framework: 'ifrs_sme',
  status: 'fieldwork',
} satisfies Pick<Engagement, 'id' | 'client_name' | 'period_end' | 'framework' | 'status'>
