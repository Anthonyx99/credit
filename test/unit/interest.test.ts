import { describe, expect, it } from 'vitest'
import {
  compareStrategies,
  effectiveHorizonMonths,
  findIndifferenceRate,
  normalizeInterestInput,
} from '../../shared/utils/interest'
import type { InterestInput } from '../../shared/types/interest'

function makeInput(overrides: Partial<InterestInput> = {}): InterestInput {
  return {
    principal: 200000,
    durationMonths: 240,
    annualRate: 3.5,
    monthlyAmount: 300,
    placementRate: 2.5,
    placementCap: 0,
    horizonMonths: 240,
    ...overrides,
  }
}

describe('effectiveHorizonMonths', () => {
  it('falls back to the loan duration', () => {
    expect(effectiveHorizonMonths(makeInput({ horizonMonths: 0 }))).toBe(240)
  })

  it('keeps an explicit horizon', () => {
    expect(effectiveHorizonMonths(makeInput({ horizonMonths: 120 }))).toBe(120)
  })
})

describe('normalizeInterestInput', () => {
  it('clamps invalid values', () => {
    const normalized = normalizeInterestInput({
      principal: -1000,
      durationMonths: 0,
      annualRate: -1,
      monthlyAmount: -50,
      placementRate: -2,
      placementCap: -10,
      horizonMonths: -3,
    })

    expect(normalized.principal).toBe(0)
    expect(normalized.durationMonths).toBe(1)
    expect(normalized.annualRate).toBe(0)
    expect(normalized.monthlyAmount).toBe(0)
    expect(normalized.placementRate).toBe(0)
    expect(normalized.placementCap).toBe(0)
    expect(normalized.horizonMonths).toBe(0)
  })
})

describe('compareStrategies', () => {
  it('repays the loan before the scheduled term', () => {
    const result = compareStrategies(makeInput())

    expect(result.repaymentMonths).toBeGreaterThan(0)
    expect(result.repaymentMonths).toBeLessThan(240)
    expect(result.rows.at(-1)?.repayBalance).toBeLessThan(0.05)
  })

  it('favours repayment when the placement yields less than the loan', () => {
    const result = compareStrategies(makeInput({ placementRate: 1 }))

    expect(result.investFinal).toBeLessThan(result.repayFinal)
    expect(result.breakEvenMonth).toBeNull()
    expect(result.repayInterest).toBeLessThan(result.investInterest)
  })

  it('favours the placement when the yield exceeds the loan rate', () => {
    const result = compareStrategies(makeInput({ placementRate: 8 }))

    expect(result.investFinal).toBeGreaterThan(result.repayFinal)
    expect(result.breakEvenMonth).not.toBeNull()
  })

  it('caps the placement earnings', () => {
    const uncapped = compareStrategies(makeInput({ placementRate: 8, placementCap: 0 }))
    const capped = compareStrategies(makeInput({ placementRate: 8, placementCap: 5000 }))

    expect(capped.investFinal).toBeLessThan(uncapped.investFinal)
  })

  it('compares both strategies at the chosen horizon', () => {
    const short = compareStrategies(makeInput({ placementRate: 8, horizonMonths: 60 }))
    const long = compareStrategies(makeInput({ placementRate: 8, horizonMonths: 300 }))

    expect(short.rows).toHaveLength(60)
    expect(long.rows).toHaveLength(300)
    expect(long.investFinal).toBeGreaterThan(short.investFinal)
  })

  it('is neutral without a monthly amount', () => {
    const result = compareStrategies(makeInput({ monthlyAmount: 0 }))

    expect(result.investFinal).toBeCloseTo(result.repayFinal, 2)
    expect(result.breakEvenMonth).toBeNull()
    expect(result.indifferenceRate).toBeNull()
  })
})

describe('findIndifferenceRate', () => {
  it('returns the rate where both strategies break even', () => {
    const rate = findIndifferenceRate(makeInput())

    expect(rate).not.toBeNull()

    const below = compareStrategies(makeInput({ placementRate: (rate as number) - 0.05 }))
    const above = compareStrategies(makeInput({ placementRate: (rate as number) + 0.05 }))

    expect(below.investFinal).toBeLessThan(below.repayFinal)
    expect(above.investFinal).toBeGreaterThan(above.repayFinal)
  })

  it('is close to the loan rate without cap or horizon effect', () => {
    const rate = findIndifferenceRate(makeInput({ monthlyAmount: 200 }))

    expect(rate).not.toBeNull()
    expect(rate as number).toBeGreaterThan(3)
    expect(rate as number).toBeLessThan(4)
  })
})
