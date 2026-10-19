import { describe, expect, it } from 'vitest'
import { buildSchedule, computeInstallment } from '../../shared/utils/amortization'
import type { LoanInput } from '../../shared/types/loan'

function makeInput(overrides: Partial<LoanInput> = {}): LoanInput {
  return {
    principal: 120000,
    durationMonths: 240,
    annualRate: 4,
    repaymentMode: 'duration',
    reinvestDifference: false,
    injections: [],
    ...overrides,
  }
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

describe('computeInstallment', () => {
  it('splits evenly when the rate is zero', () => {
    expect(computeInstallment(1200, 12, 0)).toBeCloseTo(100, 6)
  })

  it('is above the first month interest for a positive rate', () => {
    const installment = computeInstallment(120000, 240, 0.04 / 12)

    expect(installment).toBeGreaterThan(120000 * (0.04 / 12))
  })
})

describe('buildSchedule', () => {
  it('repays the principal exactly over the term', () => {
    const result = buildSchedule(makeInput())

    expect(result.actualMonths).toBe(240)
    expect(result.monthsSaved).toBe(0)
    expect(sum(result.rows.map((row) => row.principal))).toBeCloseTo(120000, 1)
    expect(result.rows.at(-1)?.closingBalance).toBeLessThan(0.05)
  })

  it('keeps total paid equal to principal plus interest', () => {
    const result = buildSchedule(makeInput())

    expect(result.totalPaid).toBeCloseTo(120000 + result.totalInterest, 6)
  })

  it('shortens the term when the installment is kept constant', () => {
    const result = buildSchedule(
      makeInput({
        repaymentMode: 'payment',
        injections: Array.from({ length: 36 }, () => 300),
      }),
    )

    expect(result.actualMonths).toBeLessThan(240)
    expect(result.monthsSaved).toBeGreaterThan(0)
    expect(result.interestSaved).toBeGreaterThan(0)
  })

  it('keeps the term when only injections are added without reinvesting', () => {
    const injections = Array.from({ length: 240 }, (_, index) => (index < 24 ? 400 : 0))
    const result = buildSchedule(makeInput({ injections }))

    expect(result.actualMonths).toBe(240)
    expect(result.monthsSaved).toBe(0)
    expect(result.totalInjection).toBeCloseTo(sum(injections), 6)
    expect(result.interestSaved).toBeGreaterThan(0)
  })

  it('makes keeping the installment equivalent to reinvesting the difference', () => {
    const injections = Array.from({ length: 120 }, (_, index) => (index < 30 ? 250 : 0))
    const duration = buildSchedule(
      makeInput({ repaymentMode: 'duration', reinvestDifference: true, injections }),
    )
    const payment = buildSchedule(
      makeInput({ repaymentMode: 'payment', reinvestDifference: false, injections }),
    )

    expect(payment.rows).toEqual(duration.rows)
  })

  it('reports the reinvested difference when the installment is kept', () => {
    const result = buildSchedule(
      makeInput({ repaymentMode: 'payment', injections: Array.from({ length: 60 }, () => 300) }),
    )

    expect(result.rows[0]?.installment).toBeCloseTo(result.initialInstallment, 6)
    expect(result.rows[0]?.reinvested).toBe(0)
    expect(result.rows[1]?.reinvested).toBeGreaterThan(0)
    expect(sum(result.rows.map((row) => row.reinvested))).toBeGreaterThan(0)
  })

  it('splits the repaid capital between the installment and the injections', () => {
    const injections = Array.from({ length: 120 }, (_, index) => (index < 24 ? 400 : 0))
    const result = buildSchedule(makeInput({ injections }))

    for (const row of result.rows) {
      expect(row.installmentPrincipal + row.extraPrincipal).toBeCloseTo(row.principal, 6)
    }
    expect(sum(result.rows.map((row) => row.extraPrincipal))).toBeCloseTo(9600, 2)
  })

  it('ignores injections past the term', () => {
    const injections = [500, ...Array.from({ length: 239 }, () => 0)]
    const result = buildSchedule(makeInput({ injections }))

    expect(result.totalInjection).toBeCloseTo(500, 6)
  })

  it('handles a zero rate loan', () => {
    const result = buildSchedule(makeInput({ principal: 1200, durationMonths: 12, annualRate: 0 }))

    expect(result.initialInstallment).toBeCloseTo(100, 6)
    expect(result.totalInterest).toBeCloseTo(0, 6)
    expect(result.totalPaid).toBeCloseTo(1200, 6)
  })
})
