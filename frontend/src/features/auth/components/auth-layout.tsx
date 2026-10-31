import type { ReactNode } from 'react'

import { ThemeToggle } from '@/components/layout/theme-toggle'

/** The frame around the signed-out pages: the name, a short line on what Kebera is, and one card. */
export function AuthLayout(props: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <span className="text-lg font-semibold tracking-tight">kebera</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 md:pt-20">
        <div className="bg-card w-full max-w-sm rounded-xl border p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">{props.title}</h1>
          {props.description && <p className="text-muted-foreground mt-1 text-sm">{props.description}</p>}
          <div className="mt-6">{props.children}</div>
        </div>
      </main>
      <footer className="text-muted-foreground px-4 pb-6 text-center text-xs">
        Each firm sees only its own engagements.
      </footer>
    </div>
  )
}
