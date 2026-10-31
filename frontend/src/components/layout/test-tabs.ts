import type { EngagementTab } from './engagement-tabs'

/** The Test stage tabs. Pass counts once the screens know them. */
export function testTabs(engagementId: string, counts: Partial<Record<TestTab, number>> = {}): EngagementTab[] {
  const base = `/engagements/${engagementId}/test`
  return TEST_TABS.map((t) => ({ to: `${base}/${t.path}`, label: t.label, count: counts[t.path] }))
}

export const TEST_TABS = [
  { path: 'analytics', label: 'Analytics' },
  { path: 'tests', label: 'Tests' },
  { path: 'exceptions', label: 'Exceptions' },
  { path: 'workpapers', label: 'Workpapers' },
  { path: 'requests', label: 'Client requests' },
] as const

export type TestTab = (typeof TEST_TABS)[number]['path']
