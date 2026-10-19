import { describe, expect, it } from 'vitest'

describe('useCounter', () => {
  it('increments and decrements the count', () => {
    const { count, increment, decrement } = useCounter(1)

    expect(count.value).toBe(1)
    increment()
    expect(count.value).toBe(2)
    decrement()
    expect(count.value).toBe(1)
  })
})
