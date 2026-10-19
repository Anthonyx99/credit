import { describe, expect, it } from 'vitest'
import {
  createDefaultLoanInput,
  normalizeLoanInput,
  parseLoanSimulation,
} from '../../shared/utils/loan'

describe('normalizeLoanInput', () => {
  it('pads injections to the term length', () => {
    const input = normalizeLoanInput({ durationMonths: 12, injections: [100, 200] })

    expect(input.injections).toHaveLength(12)
    expect(input.injections[0]).toBe(100)
    expect(input.injections[1]).toBe(200)
    expect(input.injections[11]).toBe(0)
  })

  it('rejects negative amounts and unknown modes', () => {
    const input = normalizeLoanInput({
      principal: -500,
      annualRate: -1,
      repaymentMode: 'nope',
      injections: [-10],
    })

    expect(input.principal).toBe(0)
    expect(input.annualRate).toBe(0)
    expect(input.repaymentMode).toBe('duration')
    expect(input.injections[0]).toBe(0)
  })

  it('produces a valid default input', () => {
    const input = createDefaultLoanInput()

    expect(input.durationMonths).toBe(240)
    expect(input.injections).toHaveLength(240)
    expect(input.repaymentMode).toBe('duration')
  })
})

describe('parseLoanSimulation', () => {
  it('reads a wrapped simulation file', () => {
    const input = parseLoanSimulation(
      JSON.stringify({ version: 1, input: { principal: 90000, durationMonths: 6 } }),
    )

    expect(input?.principal).toBe(90000)
    expect(input?.injections).toHaveLength(6)
  })

  it('reads a bare input object', () => {
    const input = parseLoanSimulation(JSON.stringify({ durationMonths: 3 }))

    expect(input?.durationMonths).toBe(3)
  })

  it('returns null on invalid json', () => {
    expect(parseLoanSimulation('{ not json')).toBeNull()
  })
})
