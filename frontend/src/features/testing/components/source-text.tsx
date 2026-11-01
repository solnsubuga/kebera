import { SourceChip } from '@/components/tickmark'

import type { Source } from '../mock-data'

/** Prose with source chips inline, as laba writes its explanations. */
export function SourceText({ parts }: { parts: (string | Source)[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? <span key={i}>{p}</span> : <SourceChip key={i}>{p.label}</SourceChip>,
      )}
    </>
  )
}
