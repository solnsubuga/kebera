import type { TickmarkKind } from '@/components/tickmark'

import type { Mark } from './sample-data'

/** Sample-data marks to Tickmark kinds; workpaper and plan rows use a graphite note mark with their own glyph. */
export const markKind = (m: Mark): TickmarkKind => (m === 'workpaper' || m === 'plan' ? 'note' : m)
