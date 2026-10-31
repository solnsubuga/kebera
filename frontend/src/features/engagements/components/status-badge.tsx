import { Badge } from '@/components/ui/badge'

import { STATUS_LABEL, type EngagementStatus } from '../types'

const VARIANT = {
  planning: 'outline',
  fieldwork: 'secondary',
  completion: 'secondary',
  signed: 'default',
} as const satisfies Record<EngagementStatus, 'outline' | 'secondary' | 'default'>

export function StatusBadge({ status }: { status: EngagementStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
