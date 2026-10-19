import { describe, expect, it } from 'vitest'
import { formatDuration } from '../../app/utils/formatDuration'

describe('formatDuration', () => {
  it('formats months only', () => {
    expect(formatDuration(7)).toBe('7 mois')
  })

  it('formats whole years', () => {
    expect(formatDuration(24)).toBe('2 ans')
    expect(formatDuration(12)).toBe('1 an')
  })

  it('formats years and months', () => {
    expect(formatDuration(30)).toBe('2 ans 6 mois')
  })
})
