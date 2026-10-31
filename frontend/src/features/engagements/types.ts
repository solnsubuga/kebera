// Mirrors app/schemas/engagement.py in the backend.
export const STATUSES = ['planning', 'fieldwork', 'completion', 'signed'] as const
export type EngagementStatus = (typeof STATUSES)[number]

export const FRAMEWORKS = { ifrs: 'IFRS', ifrs_sme: 'IFRS for SMEs' } as const
export type Framework = keyof typeof FRAMEWORKS

export type Engagement = {
  id: string
  client_name: string
  period_start: string
  period_end: string
  framework: Framework
  status: EngagementStatus
  created_at: string
  updated_at: string
}

export type EngagementCreate = Pick<Engagement, 'client_name' | 'period_start' | 'period_end' | 'framework'>
export type EngagementUpdate = Partial<Pick<Engagement, 'client_name' | 'status'>>

export type Page<T> = { items: T[]; total: number; limit: number; offset: number }

export const STATUS_LABEL: Record<EngagementStatus, string> = {
  planning: 'Planning',
  fieldwork: 'Fieldwork',
  completion: 'Completion',
  signed: 'Signed',
}
