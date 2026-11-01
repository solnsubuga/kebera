import { Link, useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCan } from '@/features/auth/api'
import { ApiError } from '@/lib/api-client'

import { useEngagement, useUpdateEngagement } from '../api'
import { STATUSES, STATUS_LABEL } from '../types'

export function EngagementPage() {
  const { id = '' } = useParams()
  const { data: e, isPending, error } = useEngagement(id)
  const update = useUpdateEngagement(id)
  const canMove = useCan('engagements.write')
  const canSign = useCan('engagements.sign')

  if (error) {
    return (
      <p className="text-sm">
        {error instanceof ApiError && error.status === 404 ? 'This engagement does not exist.' : 'Could not load it.'}{' '}
        <Link to="/" className="underline">
          Back to engagements
        </Link>
      </p>
    )
  }
  if (isPending) return <Skeleton className="h-40 w-full" />

  const at = STATUSES.indexOf(e.status)
  const next = STATUSES[at + 1]

  async function advance() {
    if (!next) return
    try {
      await update.mutateAsync({ status: next })
      toast.success(`Moved to ${STATUS_LABEL[next].toLowerCase()}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not reach the server')
    }
  }

  return (
    <>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Phase</CardTitle>
            <CardDescription>Plan, then test, then close. Phases move one step at a time.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <ol className="flex flex-wrap gap-2 text-sm" aria-label="Phases">
              {STATUSES.map((s, i) => (
                <li
                  key={s}
                  aria-current={i === at ? 'step' : undefined}
                  className={i <= at ? 'text-foreground font-medium' : 'text-muted-foreground'}
                >
                  {i > 0 && <span className="text-muted-foreground mr-2">→</span>}
                  {STATUS_LABEL[s]}
                </li>
              ))}
            </ol>
            {next && canMove && (next !== 'signed' || canSign) && (
              <Button size="sm" onClick={() => void advance()} disabled={update.isPending} className="ml-auto">
                Move to {STATUS_LABEL[next].toLowerCase()}
              </Button>
            )}
            {next === 'signed' && canMove && !canSign && (
              <p className="text-ink-muted ml-auto text-sm">The partner signs.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
