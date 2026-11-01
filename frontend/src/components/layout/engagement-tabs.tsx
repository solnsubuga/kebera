import { NavLink } from 'react-router'

import { cn } from '@/lib/utils'

export type EngagementTab = { to: string; label: string; count?: number; end?: boolean }

/** Sub-views of one stage, such as the Test stage's analytics, tests and exceptions. */
export function EngagementTabs({
  items,
  label,
  className,
}: {
  items: EngagementTab[]
  label: string
  className?: string
}) {
  return (
    <nav aria-label={label} className={cn('border-rule flex gap-1 overflow-x-auto border-b px-6 pt-2.5', className)}>
      {items.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cn(
              'text-ink-muted hover:text-ink -mb-px border-b-2 border-transparent px-3 py-2 text-[13px] whitespace-nowrap',
              isActive && 'border-ink text-ink font-semibold',
            )
          }
        >
          {t.label}
          {t.count !== undefined && <span className="tnum ml-1.5">{t.count}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
