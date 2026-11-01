import { BRAND } from '@/lib/brand'

// Sample data for the Kagera Dairies audit plan (board 16). All names and figures are invented.

export interface PlanRiskRow {
  risk: string
  assertions: string
  response: string
}

export const PLAN = {
  draftedBy: `Drafted by ${BRAND} from the matrix, 30 Oct · edited by Grace A.`,
  title: 'Audit plan: Kagera Dairies Ltd, year ending 30 June 2026',
  status: 'Draft · awaiting partner',
  framework: 'IFRS for SMEs · ISA',
  materiality: 'UGX 180m · PM 135m · trivial 9m',
  materialitySource: 'stage 4',
  scope: {
    before:
      'We will audit the statements of financial position, comprehensive income, changes in equity and cash flows. Testing covers the full ledger of 48,213 transactions',
    source: 'GL import r-0390',
    after: ', with samples only where documents must be inspected by hand.',
  },
  risks: [
    {
      risk: 'Revenue cut-off around 30 June',
      assertions: 'E, Ct',
      response: 'Every invoice 15 June to 15 July to a delivery note',
    },
    {
      risk: 'Payments to related-party supplier',
      assertions: 'E, P',
      response: 'All Lwera Feeds payments to contracts, approvals and goods received',
    },
    { risk: 'Management override', assertions: 'All', response: 'Every manual journal scored; top 40 inspected' },
  ] satisfies PlanRiskRow[],
  relatedParty: {
    before: 'The related-party risk comes from acceptance',
    source: 'r-0388',
    after: '. Specific materiality of UGX 50m applies to these payments.',
  },
  timetable: 'Fieldwork 3 to 21 November · clearance meeting 26 November · signing by 30 November.',
}

export interface PlanComment {
  id: string
  initials: string
  author: string
  role: string
  ago: string
  body: string
  suggestion: string
}

export const PLAN_COMMENTS: PlanComment[] = [
  {
    id: 'c1',
    initials: 'DO',
    author: 'D. Okello',
    role: 'Partner',
    ago: '2h',
    body: 'Add inventory as a significant risk. Milk powder expiry has caught us before.',
    suggestion: `${BRAND} can add the row and the expiry test`,
  },
]
