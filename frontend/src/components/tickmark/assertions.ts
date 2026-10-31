/** The six claims hidden in every number. */
export const ASSERTIONS = [
  { key: 'E', name: 'Existence' },
  { key: 'C', name: 'Completeness' },
  { key: 'R', name: 'Rights and obligations' },
  { key: 'V', name: 'Valuation' },
  { key: 'Ct', name: 'Cut-off' },
  { key: 'P', name: 'Presentation' },
] as const

export type AssertionKey = (typeof ASSERTIONS)[number]['key']
/** covered: a signed test covers it. planned: a test is planned. Missing means neither. */
export type AssertionState = 'covered' | 'planned' | 'none'
