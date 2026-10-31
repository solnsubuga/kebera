import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMe } from '@/features/auth/api'
import { ROLE_HINT, ROLE_LABEL, ROLES, type Role } from '@/features/auth/types'
import { ApiError } from '@/lib/api-client'
import { formatDate } from '@/lib/format'

import { useMembers, useUpdateMember } from '../api'
import { AddMemberDialog } from '../components/add-member-dialog'
import type { Member, MemberPatch } from '../types'

export function MembersPage() {
  const { data: me } = useMe()
  const { data, isPending, isError } = useMembers()
  const update = useUpdateMember()

  async function change(m: Member, patch: MemberPatch, done: string) {
    try {
      await update.mutateAsync({ id: m.id, ...patch })
      toast.success(done)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not reach the server')
    }
  }

  return (
    <>
      <PageHeader title="People" description={`Everyone in ${me?.firm?.name ?? 'your firm'} and what they can do.`}>
        <AddMemberDialog firmName={me?.firm?.name ?? 'your firm'} />
      </PageHeader>

      <ul className="text-muted-foreground mb-4 grid gap-1 text-xs sm:grid-cols-3">
        {ROLES.map((r) => (
          <li key={r}>
            <span className="text-foreground font-medium">{ROLE_LABEL[r]}:</span> {ROLE_HINT[r].toLowerCase()}
          </li>
        ))}
      </ul>

      {isError ? (
        <p className="text-sm">Could not load the people in your firm.</p>
      ) : isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last sign-in</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((m) => {
                const self = m.user_id === me?.user.id
                return (
                  <TableRow key={m.id} className={m.is_active ? undefined : 'opacity-60'}>
                    <TableCell>
                      <div className="font-medium">
                        {m.name}
                        {self && <span className="text-muted-foreground font-normal"> (you)</span>}
                      </div>
                      <div className="text-muted-foreground text-xs">{m.email}</div>
                    </TableCell>
                    <TableCell>
                      {self ? (
                        ROLE_LABEL[m.role]
                      ) : (
                        <Select
                          value={m.role}
                          onValueChange={(v) =>
                            void change(
                              m,
                              { role: v as Role },
                              `${m.name} is now ${ROLE_LABEL[v as Role].toLowerCase()}`,
                            )
                          }
                        >
                          <SelectTrigger size="sm" aria-label={`Role of ${m.email}`} className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Status m={m} />
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {!self && m.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void change(m, { send_link: true }, `Sent ${m.email} a sign-in link`)}
                        >
                          {m.confirmed ? 'Send link' : 'Resend invite'}
                        </Button>
                      )}
                      {!self && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            void change(
                              m,
                              { is_active: !m.is_active },
                              m.is_active ? `${m.name} can no longer sign in here` : `${m.name} can sign in again`,
                            )
                          }
                        >
                          {m.is_active ? 'Remove access' : 'Restore access'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}

function Status({ m }: { m: Member }) {
  if (!m.is_active) return <Badge variant="outline">No access</Badge>
  if (m.locked) return <Badge variant="destructive">Locked</Badge>
  if (!m.confirmed) return <Badge variant="secondary">Invited</Badge>
  return <span className="text-muted-foreground">{m.last_login_at ? formatDate(m.last_login_at) : 'Never'}</span>
}
