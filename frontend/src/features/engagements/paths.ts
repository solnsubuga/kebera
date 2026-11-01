import type { StageKey } from '@/components/layout/stages'

type Target = StageKey | 'exceptions' | 'workpapers' | 'requests'

const SEGMENT: Record<Target, string> = {
  accept: 'accept',
  connect: 'connect',
  understand: 'understand',
  materiality: 'materiality',
  risk: 'risk',
  test: 'test/tests',
  evaluate: 'evaluate',
  report: 'report',
  exceptions: 'test/exceptions',
  workpapers: 'test/workpapers',
  requests: 'test/requests',
}

/** The app route for a screen of one engagement. */
export const engagementPath = (id: string, to: Target) => `/engagements/${id}/${SEGMENT[to]}`
