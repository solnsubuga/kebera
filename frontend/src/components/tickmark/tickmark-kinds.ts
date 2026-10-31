/**
 * What a mark says. The glyph and ink follow the Tickmark language:
 * pine for agreement, vermilion for an exception, ochre for a client query, graphite for a signature.
 */
export const TICKMARKS = {
  agreed: { glyph: '✓', ink: 'pine', label: 'Agreed to supporting document' },
  traced: { glyph: 'T', ink: 'pine', label: 'Traced from source to ledger' },
  footed: { glyph: 'F', ink: 'pine', label: 'Footed: recomputed in code' },
  exception: { glyph: '✕', ink: 'vermilion', label: 'Exception found' },
  query: { glyph: '?', ink: 'ochre', label: 'Query open with client' },
  signed: { glyph: 'S', ink: 'ink', label: 'Signed' },
  /** A neutral graphite mark with your own glyph, such as W for a workpaper or a stage number. */
  note: { glyph: '•', ink: 'ink', label: '' },
} as const

export type TickmarkKind = keyof typeof TICKMARKS
