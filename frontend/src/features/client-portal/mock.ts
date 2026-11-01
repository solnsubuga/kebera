// Sample data for the client's request link (Kagera Dairies, request R-05), until the portal API exists.

export type NoteState = 'ok' | 'query' | 'missing'

export type DeliveryNote = {
  invoice: string
  amount: number
  state: NoteState
  /** What kebera says about the uploaded note, in the client's words. */
  note: string
}

export const FIRM = 'Nakato & Partners'

export const CLIENT_REQUEST = {
  index: 1,
  of: 2,
  question: 'Can you explain the June sales of UGX 2.1bn?',
  askedBy: 'Grace A.',
  audit: 'Kagera Dairies',
  due: '7 Nov',
  progress: 0.35,
  prompt: 'What happened in June?',
  answer: 'We ran a school milk promotion with two distributors from 10 June.',
  notesUploaded: 7,
  notesTotal: 20,
  notes: [
    { invoice: 'INV-S-7779', amount: 61_500_000, state: 'ok', note: 'Dated 28 Jun, signed. Thanks' },
    {
      invoice: 'INV-S-7781',
      amount: 24_000_000,
      state: 'query',
      note: 'This note is dated 3 July. Was it delivered in June?',
    },
    { invoice: 'INV-S-7775', amount: 48_000_000, state: 'missing', note: 'Not uploaded yet' },
    { invoice: 'INV-S-7770', amount: 39_200_000, state: 'missing', note: 'Not uploaded yet' },
  ] satisfies DeliveryNote[],
}

/** 61,500,000 -> "61.5m", the short form used on phones. */
export function millions(n: number) {
  return `${(n / 1_000_000).toFixed(1)}m`
}
