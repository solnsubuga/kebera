import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

const chipTone = {
  neutral: 'bg-fill text-ink',
  sample: 'bg-ochre-wash text-ochre',
  client: 'bg-ochre-wash text-ochre',
  pine: 'bg-pine-wash text-pine',
  vermilion: 'bg-vermilion-wash text-vermilion',
  link: 'bg-link-wash text-link',
} as const

export type ChipTone = keyof typeof chipTone

/** A small rounded label: filters, people, counts. Pass `pressed` to use it as a toggle. */
export function Chip({
  tone = 'neutral',
  className,
  pressed,
  ...props
}: ComponentProps<'span'> & { tone?: ChipTone; pressed?: boolean }) {
  return (
    <span
      data-pressed={pressed || undefined}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap',
        chipTone[tone],
        'data-[pressed]:bg-ink data-[pressed]:text-on-ink',
        className,
      )}
      {...props}
    />
  )
}

/** Marks any screen that shows invented figures. */
export function SampleChip({
  children = 'Illustration with sample data',
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <Chip tone="sample" className={className}>
      {children}
    </Chip>
  )
}

type SourceChipProps = {
  children: ReactNode
  /** Where the evidence opens. An internal path uses the router; anything else is a plain link. */
  href?: string
  onClick?: () => void
  className?: string
  title?: string
}

const sourceClass =
  'inline-flex items-center rounded-md bg-link-wash px-1.5 py-px align-baseline font-mono text-[11.5px] leading-[18px] whitespace-nowrap text-link'

/**
 * The reference that backs a figure: a ledger line, a page, a run.
 * "A figure without a chip is a bug." Clicking it should open the evidence.
 */
export function SourceChip({ children, href, onClick, className, title }: SourceChipProps) {
  const cls = cn(sourceClass, (href || onClick) && 'cursor-pointer hover:bg-link hover:text-white', className)
  if (href?.startsWith('/'))
    return (
      <Link to={href} className={cls} title={title}>
        {children}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={cls} title={title} target="_blank" rel="noreferrer">
        {children}
      </a>
    )
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls} title={title}>
        {children}
      </button>
    )
  return (
    <span className={cls} title={title}>
      {children}
    </span>
  )
}

/** A key cap, for keyboard hints. */
export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'border-rule-strong bg-sheet text-ink-soft inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-b-2 px-1 font-mono text-[11px] leading-none font-normal',
        className,
      )}
      {...props}
    />
  )
}
