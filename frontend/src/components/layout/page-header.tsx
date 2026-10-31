import type { ReactNode } from 'react'

export function PageHeader(props: { title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{props.title}</h1>
        {props.description && <p className="text-muted-foreground mt-1 text-sm">{props.description}</p>}
      </div>
      {props.children && <div className="flex items-center gap-2">{props.children}</div>}
    </header>
  )
}
