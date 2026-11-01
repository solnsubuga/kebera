import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The body every Test-stage page shares: content on the grey ground, then the page's one sign line pinned
 * to the bottom. The engagement header, stage spine and Test tabs come from the route layouts.
 */
export function TestStage({
  children,
  signLine,
  flush,
}: {
  children: ReactNode
  signLine: ReactNode
  flush?: boolean
}) {
  return (
    <>
      <div className={cn('bg-ground flex flex-1 flex-col', !flush && 'px-4 py-5 md:px-6')}>{children}</div>
      {signLine}
    </>
  )
}
