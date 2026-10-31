const full = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const short = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

/** 180_000_000 -> "180.0m", 9_000_000 -> "9.0m", 4_500 -> "4,500". */
export function formatShort(amount: number) {
  const abs = Math.abs(amount)
  if (abs >= 1e9) return `${short.format(amount / 1e9)}bn`
  if (abs >= 1e6) return `${short.format(amount / 1e6)}m`
  return full.format(amount)
}

export function formatAmount(amount: number, currency?: string) {
  return currency ? `${currency} ${full.format(amount)}` : full.format(amount)
}
