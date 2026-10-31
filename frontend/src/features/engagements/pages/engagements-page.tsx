import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/layout/page-header'
import { useCan } from '@/features/auth/api'
import { formatDate } from '@/lib/format'

import { useEngagements } from '../api'
import { NewEngagementDialog } from '../components/new-engagement-dialog'
import { StatusBadge } from '../components/status-badge'
import { FRAMEWORKS, STATUSES, STATUS_LABEL, type EngagementStatus } from '../types'

export function EngagementsPage() {
  const [status, setStatus] = useState<EngagementStatus | undefined>()
  const { data, isPending, isError, refetch } = useEngagements(status)
  const canOpen = useCan('engagements.write')

  return (
    <>
      <PageHeader title="Engagements" description="Every audit your firm is running, latest period first.">
        {canOpen && <NewEngagementDialog />}
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by phase">
        <FilterButton active={status === undefined} onClick={() => setStatus(undefined)}>
          All
        </FilterButton>
        {STATUSES.map((s) => (
          <FilterButton key={s} active={status === s} onClick={() => setStatus(s)}>
            {STATUS_LABEL[s]}
          </FilterButton>
        ))}
      </div>

      {isError ? (
        <div className="rounded-lg border p-6 text-sm">
          Could not load engagements.{' '}
          <Button variant="link" className="h-auto p-0" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          {status
            ? `No engagements in ${STATUS_LABEL[status].toLowerCase()}.`
            : canOpen
              ? 'No engagements yet. Open the first one.'
              : 'No engagements yet.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Period end</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Phase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    <Link to={`/engagements/${e.id}`} className="hover:underline">
                      {e.client_name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(e.period_end)}</TableCell>
                  <TableCell>{FRAMEWORKS[e.framework]}</TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}

function FilterButton(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      size="sm"
      variant={props.active ? 'secondary' : 'ghost'}
      aria-pressed={props.active}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  )
}
