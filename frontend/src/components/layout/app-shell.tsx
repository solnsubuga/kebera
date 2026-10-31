import { BriefcaseBusiness, ScrollText, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { useMe } from '@/features/auth/api'
import { FirmSwitcher, UserMenu } from '@/features/auth/components/user-menu'
import type { Permission } from '@/features/auth/types'
import { HealthIndicator } from '@/features/system/health-indicator'
import { cn } from '@/lib/utils'

import { ThemeToggle } from './theme-toggle'

const NAV: { to: string; label: string; icon: typeof Users; end: boolean; needs?: Permission }[] = [
  { to: '/', label: 'Engagements', icon: BriefcaseBusiness, end: false },
  { to: '/people', label: 'People', icon: Users, end: false, needs: 'members.manage' },
  { to: '/audit', label: 'Audit log', icon: ScrollText, end: false, needs: 'audit.read' },
]

export function AppShell() {
  const { data: me } = useMe()
  const { pathname } = useLocation()
  const nav = NAV.filter((n) => !n.needs || me?.permissions.includes(n.needs))
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="bg-card flex shrink-0 flex-col gap-4 border-b p-4 md:sticky md:top-0 md:h-svh md:w-60 md:border-r md:border-b-0">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">kebera</span>
          <ThemeToggle />
        </div>
        <FirmSwitcher />
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end || to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap',
                  isActive || (to === '/' && pathname.startsWith('/engagements'))
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'hover:bg-muted',
                )
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto grid gap-3">
          <UserMenu />
          <div className="hidden md:block">
            <HealthIndicator />
          </div>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
