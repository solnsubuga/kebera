import { EngagementTabs } from '@/components/layout/engagement-tabs'

/** The tabs under stage 5, shared by the risk matrix and the plan. */
export function PlanningTabs({ id }: { id: string }) {
  return (
    <EngagementTabs
      label="Risk and plan views"
      className="bg-sheet shrink-0"
      items={[
        { to: `/engagements/${id}/risk`, label: 'Risk and control matrix' },
        { to: `/engagements/${id}/plan`, label: 'Audit plan' },
        { to: `/engagements/${id}/walkthroughs`, label: 'Walkthroughs', count: 3 },
      ]}
    />
  )
}
