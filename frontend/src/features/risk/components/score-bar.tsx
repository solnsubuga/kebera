/** The model's 0 to 100 score as a short bar and a figure. */
export function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="bg-rule block h-[5px] w-14 overflow-hidden rounded-full" aria-hidden="true">
        <span className="bg-link block h-full" style={{ width: `${value}%` }} />
      </span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
