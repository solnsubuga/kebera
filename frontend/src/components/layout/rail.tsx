import { Search } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'

import { NAV } from '@/app/nav'
import { useCommandPalette } from '@/components/command'
import { Kbd } from '@/components/tickmark'
import { HealthIndicator } from '@/features/system/health-indicator'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'

import { ThemeToggle } from './theme-toggle'

/** The frosted left rail: brand, Ask, the main links, and system health. On phones it sits on top. */
export function Rail({ subtitle }: { subtitle?: string }) {
  const { setOpen } = useCommandPalette()
  const { pathname } = useLocation()
  return (
    <aside className="bg-rail frosted border-rule z-20 flex shrink-0 flex-col gap-0.5 border-b px-3 py-3 md:sticky md:top-0 md:h-svh md:w-[232px] md:border-r md:border-b-0 md:py-4">
      <div className="flex items-center gap-2.5 px-2 pb-2 md:pb-3.5">
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-[9px] bg-gradient-to-b from-[#2c2c2e] to-[#1d1d1f] font-mono text-[15px] font-semibold text-white"
        >
          {BRAND[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{BRAND}</div>
          {subtitle && <div className="text-ink-muted truncate text-xs">{subtitle}</div>}
        </div>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-fill text-ink-muted hover:text-ink mb-2.5 flex h-9 items-center gap-2 rounded-[10px] px-2.5 text-[13px]"
      >
        <Search className="size-4" aria-hidden="true" />
        Ask {BRAND}
        <Kbd className="ml-auto">⌘K</Kbd>
      </button>
      <nav aria-label="Main" className="-mx-1 flex gap-0.5 overflow-x-auto px-1 md:flex-col md:overflow-visible">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = 'match' in item ? item.match.test(pathname) : pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'text-ink-soft hover:text-ink flex h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-2.5 text-sm',
                active && 'bg-sheet text-ink shadow-raised font-medium',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-rule mt-auto hidden items-center justify-between gap-2 border-t px-2.5 pt-3 md:flex">
        <HealthIndicator />
        <ThemeToggle />
      </div>
    </aside>
  )
}
