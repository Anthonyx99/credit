import type { LoanInput, LoanSimulationFile } from '../types/loan'

export const SIMULATION_FILE_VERSION = 1

const DEFAULT_PRINCIPAL = 200000
const DEFAULT_DURATION_MONTHS = 240
const DEFAULT_ANNUAL_RATE = 3.5

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function normalizeLoanInput(raw: unknown): LoanInput {
  const source = (raw ?? {}) as Partial<LoanInput>
  const durationMonths = Math.max(
    1,
    Math.round(toNumber(source.durationMonths, DEFAULT_DURATION_MONTHS)),
  )
  const injections = Array.isArray(source.injections) ? source.injections : []

  return {
    principal: Math.max(0, toNumber(source.principal, DEFAULT_PRINCIPAL)),
    durationMonths,
    annualRate: Math.max(0, toNumber(source.annualRate, DEFAULT_ANNUAL_RATE)),
    repaymentMode: source.repaymentMode === 'payment' ? 'payment' : 'duration',
    reinvestDifference: toBoolean(source.reinvestDifference, false),
    injections: Array.from({ length: durationMonths }, (_, index) =>
      Math.max(0, toNumber(injections[index], 0)),
    ),
  }
}

export function createDefaultLoanInput(): LoanInput {
  return normalizeLoanInput({})
}

export function parseLoanSimulation(raw: string): LoanInput | null {
  try {
    const parsed = JSON.parse(raw) as Partial<LoanSimulationFile> & Partial<LoanInput>
    return normalizeLoanInput(parsed.input ?? parsed)
  } catch {
    return null
  }
}
