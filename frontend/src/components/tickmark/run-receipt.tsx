import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * What produced a result, so it can be rerun for the same answer. File reviewers read this.
 * Pass the lines in reading order, for example run id and test, data hash and rows, model, time and cost.
 */
export function RunReceipt({ lines, className }: { lines: ReactNode[]; className?: string }) {
  return (
    <div
      aria-label="Run receipt"
      className={cn('bg-ground text-ink-soft rounded-lg px-3 py-2.5 font-mono text-[11.5px] leading-[1.7]', className)}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  )
}
