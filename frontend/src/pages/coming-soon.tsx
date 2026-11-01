import { Link } from 'react-router'

/** Stands in for a screen that is still being built. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-ink-muted text-sm">This screen is being built.</p>
      <Link to="/" className="text-link mt-2 text-sm hover:underline">
        Back to engagements
      </Link>
    </div>
  )
}
