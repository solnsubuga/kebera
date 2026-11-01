import { Tickmark } from '@/components/tickmark'

import type { Mark } from '../mock-data'

/** laba's proposed mark on a line: always hollow, since no person has confirmed it yet. */
export function MarkCell({ mark }: { mark: Mark }) {
  return <Tickmark kind={mark} />
}
