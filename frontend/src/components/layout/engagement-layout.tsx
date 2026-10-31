import { Link, Outlet, useLocation, useParams } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { useEngagement } from '@/features/engagements/api'
import { ApiError } from '@/lib/api-client'

import { EngagementHeader } from './engagement-header'
import { EngagementTabs } from './engagement-tabs'
import { testTabs } from './test-tabs'
import { stageFromPath } from './stages'

/**
 * Every /engagements/:id/... screen renders inside this: the header and stage spine come from here,
 * so a screen renders only its own content.
 */
export function EngagementLayout() {
  const { id = '' } = useParams()
  const { pathname } = useLocation()
  const { data, error, isPending } = useEngagement(id)

  if (error) {
    return (
      <p className="px-6 py-8 text-sm">
        {error instanceof ApiError && error.status === 404 ? 'This engagement does not exist.' : 'Could not load it.'}{' '}
        <Link to="/" className="text-link hover:underline">
          Back to engagements
        </Link>
      </p>
    )
  }
  if (isPending) return <Skeleton className="m-6 h-24" />

  return (
    <>
      <EngagementHeader engagement={data} viewing={stageFromPath(pathname)} />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet context={data} />
      </div>
    </>
  )
}

/** The Test stage: its five tabs, then the tab's screen. */
export function TestStageLayout() {
  const { id = '' } = useParams()
  return (
    <>
      <EngagementTabs label="Test views" items={testTabs(id)} />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </>
  )
}
