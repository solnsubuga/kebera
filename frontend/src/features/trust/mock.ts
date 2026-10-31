// Sample data for the Trust page, taken from the design board, until kebera's evaluation and audit trail APIs exist.

export type TestAccuracy = {
  test: string
  /** Share of planted errors caught, 0 to 100. */
  catches: number
  falseAlarmsPer1000: number
  reviewersAgreed: number
  measured: string
  status: 'rely' | 'review'
}

export const SUMMARY = { agreedPct: 81, exceptions: 412, missed: 43, planted: 1240, ledgers: 6 }

export const ACCURACY: TestAccuracy[] = [
  {
    test: 'Approval limits',
    catches: 99,
    falseAlarmsPer1000: 0.3,
    reviewersAgreed: 93,
    measured: '12 Oct · v4',
    status: 'rely',
  },
  {
    test: 'Duplicate payments',
    catches: 98,
    falseAlarmsPer1000: 0.8,
    reviewersAgreed: 86,
    measured: '12 Oct · v5',
    status: 'rely',
  },
  {
    test: 'Three-way match',
    catches: 96,
    falseAlarmsPer1000: 1.2,
    reviewersAgreed: 79,
    measured: '12 Oct · v3',
    status: 'rely',
  },
  {
    test: 'Revenue cut-off',
    catches: 94,
    falseAlarmsPer1000: 1.5,
    reviewersAgreed: 74,
    measured: '12 Oct · v2',
    status: 'rely',
  },
  {
    test: 'Journals by unusual users',
    catches: 91,
    falseAlarmsPer1000: 2.0,
    reviewersAgreed: 68,
    measured: '12 Oct · v2',
    status: 'review',
  },
  {
    test: 'Split payments under a limit',
    catches: 89,
    falseAlarmsPer1000: 2.6,
    reviewersAgreed: 61,
    measured: '12 Oct · v1',
    status: 'review',
  },
]

export type TrailEvent = {
  at: string
  mark: 'signed' | 'exception' | 'agreed' | 'run'
  text: string
  source?: string
  sha?: string
  /** Text after the sha, before the source chip. */
  tail?: string
}

export const TRAIL = {
  client: 'Kagera Dairies',
  total: 412,
  events: [
    { at: '31 Oct 10:02', mark: 'signed', text: 'D. Okello approved WP C-3' },
    { at: '31 Oct 09:40', mark: 'exception', text: 'Grace A. marked PV-0611 right: exception' },
    {
      at: '31 Oct 09:38',
      mark: 'agreed',
      text: 'Grace A. marked INV-2190 wrong: credit note found',
      source: 'CN-0088',
    },
    {
      at: '30 Oct 23:12',
      mark: 'run',
      text: 'kebera ran three-way match on ledger',
      sha: 'sha 9f2c…e1',
      tail: ', test v3, model [pinned]',
      source: 'r-0402',
    },
    { at: '30 Oct 09:14', mark: 'run', text: 'kebera ran acceptance checks', source: 'r-0388' },
  ] satisfies TrailEvent[],
}

export const CLIENT_DATA: { label: string; value: string; consent?: boolean }[] = [
  { label: 'Where it lives', value: 'One vault per engagement · [REGION]' },
  { label: 'Encryption', value: 'At rest and in transit' },
  { label: 'Used to train models', value: 'Never' },
  { label: 'Deleted', value: "[N] days after signing, unless the firm's archive rule says longer" },
  { label: 'Who can open Kagera', value: 'GA, PM, DO · client contact for requests only' },
  { label: 'Client consent', value: 'Engagement letter, signed 31 Oct', consent: true },
  { label: 'Law', value: 'Data Protection and Privacy Act 2019' },
]
