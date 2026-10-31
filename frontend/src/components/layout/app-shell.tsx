import { BriefcaseBusiness } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

import { HealthIndicator } from '@/features/system/health-indicator'
import { cn } from '@/lib/utils'

import { ThemeToggle } from './theme-toggle'

const NAV = [{ to: '/', label: 'Engagements', icon: BriefcaseBusiness, end: false }]

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="bg-card flex shrink-0 flex-col gap-4 border-b p-4 md:w-56 md:border-r md:border-b-0">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">kebera</span>
          <ThemeToggle />
        </div>
        <nav aria-label="Main" className="flex gap-1 md:flex-col">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                  isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted',
                )
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden md:block">
          <HealthIndicator />
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
