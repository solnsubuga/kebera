import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AssertionStrip, MaterialityRuler, Tickmark } from '.'

describe('tickmark', () => {
  it('is hollow until a person confirms it', () => {
    render(
      <>
        <Tickmark kind="exception" />
        <Tickmark kind="exception" confirmed />
      </>,
    )
    expect(screen.getByRole('img', { name: 'Exception found, proposed' })).toHaveAttribute('data-state', 'proposed')
    expect(screen.getByRole('img', { name: 'Exception found, confirmed by a person' })).toHaveAttribute(
      'data-state',
      'confirmed',
    )
  })

  it('draws a signature solid', () => {
    render(<Tickmark kind="signed" />)
    expect(screen.getByRole('img')).toHaveAttribute('data-state', 'confirmed')
  })

  it('names each assertion and its coverage', () => {
    render(<AssertionStrip value={{ E: 'covered', V: 'planned' }} />)
    expect(screen.getByRole('listitem', { name: 'Existence: covered by a signed test' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Valuation: test planned' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Cut-off: not covered' })).toBeInTheDocument()
  })

  it('describes the ruler for screen readers', () => {
    render(
      <MaterialityRuler
        trivial={9e6}
        performance={135e6}
        overall={180e6}
        misstatements={[{ amount: 104e6, label: 'Found' }]}
      />,
    )
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Materiality ruler in UGX: trivial 9.0m, performance 135.0m, overall 180.0m. Found: 104.0m.',
    )
  })
})
