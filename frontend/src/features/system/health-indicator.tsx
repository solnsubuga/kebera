import { cn } from '@/lib/utils'

import { useHealth } from './api'

/** A small dot in the sidebar: green when the API, database and worker are all up. */
export function HealthIndicator() {
  const { data, isError } = useHealth()
  const label = isError
    ? 'API unreachable'
    : !data
      ? 'Checking…'
      : data.status === 'ok'
        ? `All systems up · v${data.version}`
        : data.database
          ? 'Worker not running'
          : 'Database down'
  const color =
    isError || data?.database === false ? 'bg-destructive' : data?.status === 'ok' ? 'bg-primary' : 'bg-amber-500'
  return (
    <p className="text-muted-foreground flex items-center gap-2 text-xs" role="status">
      <span
        aria-hidden="true"
        className={cn('size-2 rounded-full', data || isError ? color : 'bg-muted-foreground/40')}
      />
      {label}
    </p>
  )
}
