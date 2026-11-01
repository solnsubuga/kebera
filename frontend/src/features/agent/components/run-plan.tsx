import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SourceChip } from '@/components/tickmark'
import { cn } from '@/lib/utils'

import type { RunStep } from '../sample-data'

/** The run's plan as a vertical timeline: blue filled is done, blue ring is running, grey ring is queued. */
export function RunPlan({ steps, stopped, onStop }: { steps: RunStep[]; stopped: boolean; onStop: () => void }) {
  const at = steps.findIndex((s) => s.state !== 'done')
  const current = at === -1 ? steps.length : at + 1

  return (
    <Card className="min-w-0 flex-[1_1_260px] gap-0 px-[18px] py-4 xl:max-w-[320px]">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-link text-[13px] font-semibold">
          {stopped ? `Stopped at step ${current} of ${steps.length}` : `Plan · step ${current} of ${steps.length}`}
        </h2>
        <Button variant="secondary" size="sm" onClick={onStop} disabled={stopped}>
          {stopped ? 'Stopped' : 'Stop'}
        </Button>
      </div>
      <ol className="relative">
        <span className="bg-rule absolute top-5 bottom-5 left-[9px] w-0.5" aria-hidden="true" />
        {steps.map((s) => {
          const state = stopped && s.state === 'running' ? 'queued' : s.state
          return (
            <li key={s.title} className="relative flex gap-3 py-3">
              <span
                className={cn(
                  'z-[1] flex size-5 shrink-0 items-center justify-center rounded-full',
                  state === 'done' && 'bg-link text-white',
                  state === 'running' && 'bg-card ring-link ring-2 ring-inset',
                  state === 'queued' && 'bg-card ring-rule-strong ring-[1.5px] ring-inset',
                )}
              >
                {state === 'done' && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                <span className="sr-only">
                  {state === 'done' ? 'Done' : state === 'running' ? 'Running' : 'Not started'}
                </span>
              </span>
              <div className={cn(state === 'queued' && 'text-ink-muted')}>
                <div className="font-medium">{s.title}</div>
                <div className="text-ink-muted text-xs">
                  {s.detail} {s.source && <SourceChip>{s.source}</SourceChip>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
