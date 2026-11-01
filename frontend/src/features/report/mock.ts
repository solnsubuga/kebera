// Sample data for Kagera Dairies' close-out, taken from the design boards, until the report API exists.

export const PARTNER = { name: 'D. Okello', role: 'engagement partner', practisingNumber: '[NUMBER]' }

export type LetterPoint = {
  heading: string
  source: string
  body: string
  response?: string
  /** The draft is cut short on the board; a truncated point is shown greyed with an ellipsis. */
  truncated?: boolean
}

export const MANAGEMENT_LETTER = {
  provenance: 'Drafted by kebera from 3 signed workpapers · every point links to its paper',
  title: 'Letter to the Board of Kagera Dairies Ltd',
  intro:
    'During our audit for the year ended 30 June 2026 we noted the following matters. They do not change our opinion, but we recommend you act on them.',
  points: [
    {
      heading: 'Large payments approved without the board',
      source: 'WP C-4',
      body: 'Fourteen payments above UGX 50 million, totalling UGX 1.10 billion, were approved by the General Manager alone. Your finance policy requires a board resolution for each.',
      response: 'requested from R. Nansubuga, due 12 Nov',
    },
    {
      heading: 'Purchases from a related supplier',
      source: 'WP C-3',
      body: 'A director of the company also directs Lwera Feeds Ltd, which supplied UGX 1.84 billion of feed. His declaration of interest was not on file, and one payment of UGX 96 million had no proof of delivery until our audit.',
      response: 'requested, due 12 Nov',
    },
    {
      heading: 'Stock nearing expiry',
      source: 'WP D',
      body: 'Milk powder worth UGX 38 million is within 60 days of expiry',
      truncated: true,
    },
  ] satisfies LetterPoint[],
}

export const REPORT_TABS = [
  { key: 'letter', label: 'Management letter' },
  { key: 'opinion', label: 'Opinion' },
  { key: 'representation', label: 'Representation letter' },
  { key: 'checklist', label: 'Completion checklist 23/24' },
] as const

/** What the partner sees on their phone before signing (board 34). */
export const SIGN_OFF = {
  client: 'Kagera Dairies',
  period: 'FY 2025/26',
  preparedBy: 'Grace A.',
  fileVersion: 'v41',
  uncorrected: 104_200_000,
  overall: 180_000_000,
  performance: 135_000_000,
  checks: [
    { text: '3 significant risks closed' },
    { text: '37 exceptions judged by people' },
    { text: '9 workpapers reviewed' },
    { text: 'Representation letter signed', when: 'today' },
    { text: 'Management letter responses in' },
  ],
  opinion: 'An unmodified opinion',
  reportPages: 3,
}
