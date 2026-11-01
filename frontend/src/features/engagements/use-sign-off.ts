import { useState } from 'react'

import type { SignedRecord } from '@/components/tickmark'

const stamp = () =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())

/**
 * A decision on the sign line, kept on this screen until the backend records it.
 * Returns the signed record (once decided) and a function that records who, when and what.
 */
export function useSignOff() {
  const [signed, setSigned] = useState<SignedRecord>()
  const sign = (reason: string) => setSigned({ by: 'You', at: stamp(), reason })
  return [signed, sign] as const
}
