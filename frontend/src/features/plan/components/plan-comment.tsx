import type { PlanComment as Comment } from '../sample-data'

export function PlanComment({ comment: c }: { comment: Comment }) {
  return (
    <div className="bg-sheet border-rule flex flex-col gap-1.5 rounded-[10px] border p-3 text-[13px]">
      <div className="flex items-center gap-2">
        <span
          className="bg-ink text-on-ink inline-flex size-[22px] items-center justify-center rounded-full text-[10px] font-semibold"
          aria-hidden="true"
        >
          {c.initials}
        </span>
        <span className="font-medium">{c.author}</span>
        <span className="text-ink-muted text-xs">
          {c.role} · {c.ago}
        </span>
      </div>
      <p>{c.body}</p>
      <p className="text-link text-xs">{c.suggestion}</p>
    </div>
  )
}
