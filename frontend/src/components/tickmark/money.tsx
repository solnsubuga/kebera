import { formatAmount, formatShort } from '@/lib/money'
import { cn } from '@/lib/utils'

type MoneyProps = {
  amount: number
  /** Every amount has a currency. Leave it off only inside a column whose header names it. */
  currency?: string
  /** Show 180.0m instead of 180,000,000. */
  compact?: boolean
  className?: string
}

/** An amount in tabular figures, so columns foot by eye. */
export function Money({ amount, currency, compact, className }: MoneyProps) {
  const text = compact ? `${currency ? `${currency} ` : ''}${formatShort(amount)}` : formatAmount(amount, currency)
  return <span className={cn('tnum whitespace-nowrap', className)}>{text}</span>
}
