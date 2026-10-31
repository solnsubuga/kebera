import type { EngagementStatus } from '@/features/engagements/types'

/** The eight stages of a statutory audit under ISA, and the route segment each opens. */
export const STAGES = [
  { key: 'accept', label: 'Accept', path: 'accept' },
  { key: 'connect', label: 'Connect books', path: 'connect' },
  { key: 'understand', label: 'Understand', path: 'understand' },
  { key: 'materiality', label: 'Materiality', path: 'materiality' },
  { key: 'risk', label: 'Risk and plan', path: 'risk' },
  { key: 'test', label: 'Test', path: 'test' },
  { key: 'evaluate', label: 'Evaluate', path: 'evaluate' },
  { key: 'report', label: 'Report', path: 'report' },
] as const

export type StageKey = (typeof STAGES)[number]['key']

export const stageIndex = (key: StageKey) => STAGES.findIndex((s) => s.key === key)

/** Which stage a URL inside an engagement belongs to. "plan" is part of "Risk and plan". */
export function stageFromPath(pathname: string): StageKey | undefined {
  const segment = pathname.match(/^\/engagements\/[^/]+\/([^/]+)/)?.[1]
  if (segment === 'plan') return 'risk'
  return STAGES.find((s) => s.path === segment)?.key
}

/**
 * The backend tracks four phases; until it tracks all eight stages, each phase
 * starts at its first stage.
 */
export const STATUS_STAGE: Record<EngagementStatus, StageKey> = {
  planning: 'accept',
  fieldwork: 'test',
  completion: 'evaluate',
  signed: 'report',
}
