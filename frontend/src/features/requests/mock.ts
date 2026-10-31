// Sample data for Kagera Dairies, taken from the design board, until the requests API exists.

export type RequestState = 'draft' | 'waiting' | 'answered'

export type ClientRequest = {
  code: string
  title: string
  source: string
  state: RequestState
  /** Short status on the right: a due date, how late, or when it was answered. */
  when: string
  late?: boolean
  /** What the client will see. Only drafts carry one in the sample. */
  preview?: {
    question: string
    body: string
    invoices: { ref: string; customer: string; amount: number }[]
    moreInvoices: number
    acceptWhen: string
  }
}

export const CONTACT = 'R. Nansubuga, finance manager'

export const REQUESTS: ClientRequest[] = [
  {
    code: 'R-05',
    title: 'Explain the June sales of UGX 2.1bn and share June delivery notes',
    source: 'Analytics',
    state: 'draft',
    when: 'Draft',
    preview: {
      question: 'Can you explain the June sales of UGX 2.1bn?',
      body: 'June sales were more than twice a normal month. Please tell us what happened, for example a new customer or a promotion, and upload the delivery notes for the 20 largest June invoices listed below.',
      invoices: [
        { ref: 'INV-S-7781', customer: 'Mbarara Fresh Mart', amount: 24_000_000 },
        { ref: 'INV-S-7779', customer: 'Western Distributors', amount: 61_500_000 },
      ],
      moreInvoices: 18,
      acceptWhen: 'each listed invoice has a delivery note dated in June, signed by the customer.',
    },
  },
  {
    code: 'R-06',
    title: 'Support for 18% growth in the cash flow forecast',
    source: 'Model review',
    state: 'draft',
    when: 'Draft',
    preview: {
      question: 'What supports the 18% sales growth in your cash flow forecast?',
      body: 'Your forecast grows sales by 18% next year, against 6% this year. Please share the contracts, orders or plans behind the growth.',
      invoices: [],
      moreInvoices: 0,
      acceptWhen: 'the growth is backed by signed contracts or board-approved plans.',
    },
  },
  {
    code: 'R-01',
    title: 'Proof of delivery for 8 Lwera Feeds payments, UGX 312.4m',
    source: 'WP C-3',
    state: 'waiting',
    when: 'Due 4 Nov',
  },
  {
    code: 'R-02',
    title: 'Board minutes for February, March and April 2026',
    source: 'Folder',
    state: 'waiting',
    when: '2 days late',
    late: true,
  },
  {
    code: 'R-03',
    title: 'Loan agreement for the March drawdown',
    source: 'Folder',
    state: 'waiting',
    when: '2 days late',
    late: true,
  },
  {
    code: 'R-07',
    title: 'Conflict of interest declaration from J. Mugisha',
    source: 'Accept',
    state: 'waiting',
    when: 'Due 5 Nov',
  },
  {
    code: 'R-04',
    title: 'Fixed asset register · kebera checked: ties to the trial balance at 6,300m',
    source: 'FAR.xlsx',
    state: 'answered',
    when: '31 Oct',
  },
]
