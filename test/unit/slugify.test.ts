import { describe, expect, it } from 'vitest'
import { slugify } from '../../shared/utils/slugify'

describe('slugify', () => {
  it('normalizes accents and spaces', () => {
    expect(slugify('Été à Paris')).toBe('ete-a-paris')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  Hello World!  ')).toBe('hello-world')
  })
})
