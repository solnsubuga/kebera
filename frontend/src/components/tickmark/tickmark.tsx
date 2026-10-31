import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { TICKMARKS, type TickmarkKind } from './tickmark-kinds'

const HOLLOW = {
  pine: 'border-pine text-pine',
  vermilion: 'border-vermilion text-vermilion',
  ochre: 'border-ochre text-ochre',
  ink: 'border-ink text-ink',
} as const

const SOLID = {
  pine: 'border-pine bg-pine text-white',
  vermilion: 'border-vermilion bg-vermilion text-white',
  ochre: 'border-ochre bg-ochre text-white',
  ink: 'border-ink bg-ink text-on-ink',
} as const

export type TickmarkProps = {
  kind: TickmarkKind
  /** Hollow means kebera proposes it; solid means a person confirmed it. A signature is always solid. */
  confirmed?: boolean
  /** Replace the glyph, for example a stage number or "W". */
  children?: ReactNode
  size?: 'sm' | 'md'
  /** Accessible name. Defaults to the meaning of the mark and who made it. */
  label?: string
  className?: string
}

/** The small circled pencil mark that says "I checked this, against that". */
export function Tickmark({ kind, confirmed = false, children, size = 'md', label, className }: TickmarkProps) {
  const spec = TICKMARKS[kind]
  const solid = confirmed || kind === 'signed'
  const name = label ?? (spec.label ? `${spec.label}, ${solid ? 'confirmed by a person' : 'proposed'}` : undefined)
  return (
    <span
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
      data-state={solid ? 'confirmed' : 'proposed'}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] font-mono leading-none font-semibold select-none',
        size === 'md' ? 'size-[22px] text-[11.5px]' : 'size-5 text-[11px]',
        solid ? cn(SOLID[spec.ink], 'motion-safe:animate-mark-fill') : cn(HOLLOW[spec.ink], 'bg-sheet'),
        className,
      )}
    >
      {children ?? spec.glyph}
    </span>
  )
}
