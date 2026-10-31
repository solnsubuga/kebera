import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'

import { useAudit } from '../api'
import type { AuditEvent } from '../types'

const ACTIONS: Record<string, string> = {
  'auth.login': 'Signed in',
  'auth.password_set': 'Chose a password',
  'auth.password_changed': 'Changed their password',
  'auth.locked': 'Locked out after wrong passwords',
  'firm.created': 'Opened the firm',
  'member.added': 'Added',
  'member.role_set': 'Changed the role of',
  'member.activated': 'Restored access for',
  'member.deactivated': 'Removed access for',
  'member.password_cleared': 'Cleared the password of',
  'member.link_sent': 'Sent a sign-in link to',
  'engagement.created': 'Opened engagement',
  'engagement.status_set': 'Moved engagement',
}

export function AuditPage() {
  const { data, isPending, isError } = useAudit()
  return (
    <>
      <PageHeader title="Audit log" description="Who did what in your firm, newest first." />
      {isError ? (
        <p className="text-sm">Could not load the audit log.</p>
      ) : isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : data.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">Nothing yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>What</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDateTime(e.at)}
                  </TableCell>
                  <TableCell className="text-sm">{e.actor_email ?? 'System'}</TableCell>
                  <TableCell className="text-sm">{describe(e)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}

function describe(e: AuditEvent) {
  const what = ACTIONS[e.action] ?? e.action
  const target = e.target ? ` ${e.target}` : ''
  const extra = e.detail?.status
    ? ` to ${e.detail.status}`
    : e.detail?.role
      ? ` ${e.action === 'member.role_set' ? 'to' : 'as'} ${e.detail.role}`
      : ''
  return `${what}${target}${extra}`
}
