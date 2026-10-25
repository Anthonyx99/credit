import { computeInstallment, monthlyRate } from './amortization'
import type { InterestInput, InterestMonthRow, InterestResult } from '../types/interest'

export const INTEREST_FILE_VERSION = 1

const EPSILON = 0.01
const MAX_INDIFFERENCE_RATE = 30
const BISECTION_STEPS = 60

const DEFAULT_PRINCIPAL = 200000
const DEFAULT_DURATION_MONTHS = 240
const DEFAULT_ANNUAL_RATE = 3.5
const DEFAULT_MONTHLY_AMOUNT = 200
const DEFAULT_PLACEMENT_RATE = 2.5
const DEFAULT_PLACEMENT_CAP = 0

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function normalizeInterestInput(raw: unknown): InterestInput {
  const source = (raw ?? {}) as Partial<InterestInput>
  const durationMonths = Math.max(
    1,
    Math.round(toNumber(source.durationMonths, DEFAULT_DURATION_MONTHS)),
  )

  return {
    principal: Math.max(0, toNumber(source.principal, DEFAULT_PRINCIPAL)),
    durationMonths,
    annualRate: Math.max(0, toNumber(source.annualRate, DEFAULT_ANNUAL_RATE)),
    monthlyAmount: Math.max(0, toNumber(source.monthlyAmount, DEFAULT_MONTHLY_AMOUNT)),
    placementRate: Math.max(0, toNumber(source.placementRate, DEFAULT_PLACEMENT_RATE)),
    placementCap: Math.max(0, toNumber(source.placementCap, DEFAULT_PLACEMENT_CAP)),
    horizonMonths: Math.max(0, Math.round(toNumber(source.horizonMonths, durationMonths))),
  }
}

export function createDefaultInterestInput(): InterestInput {
  return normalizeInterestInput({})
}

export function parseInterestSimulation(raw: string): InterestInput | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> & { input?: unknown }
    return normalizeInterestInput(parsed.input ?? parsed)
  } catch {
    return null
  }
}

export function effectiveHorizonMonths(input: InterestInput): number {
  const duration = Math.max(1, Math.round(input.durationMonths))
  const horizon = Math.round(input.horizonMonths)
  return horizon > 0 ? Math.max(1, horizon) : duration
}

function placementEarnings(placement: number, rate: number, cap: number): number {
  if (placement <= 0) {
    return 0
  }
  const base = cap > 0 ? Math.min(placement, cap) : placement
  return base * rate
}

interface Valuation {
  rows: InterestMonthRow[]
  scheduledInstallment: number
  repaymentMonths: number
  repayInterest: number
  investInterest: number
  repayFinal: number
  investFinal: number
  breakEvenMonth: number | null
}

function valuate(input: InterestInput, placementAnnualRate: number): Valuation {
  const horizonMonths = effectiveHorizonMonths(input)
  const months = Math.max(1, Math.round(input.durationMonths))
  const principal = Math.max(0, input.principal)
  const loanRate = monthlyRate(Math.max(0, input.annualRate))
  const placeRate = monthlyRate(Math.max(0, placementAnnualRate))
  const cap = Math.max(0, input.placementCap)
  const extra = Math.max(0, input.monthlyAmount)
  const installment = computeInstallment(principal, months, loanRate)

  let repayBalance = principal
  let repayPlacement = 0
  let repayInterest = 0
  let repaymentMonths = 0

  let investBalance = principal
  let investPlacement = 0
  let investInterest = 0

  const rows: InterestMonthRow[] = []

  for (let month = 1; month <= horizonMonths; month += 1) {
    let repayContribution = installment + extra
    if (repayBalance > EPSILON) {
      const interest = repayBalance * loanRate
      const paid = Math.min(repayContribution, repayBalance + interest)
      repayBalance = Math.max(0, repayBalance - Math.max(0, paid - interest))
      repayInterest += interest
      repaymentMonths = month
      repayContribution -= paid
    }
    repayPlacement += placementEarnings(repayPlacement, placeRate, cap) + repayContribution

    let investContribution = extra
    if (investBalance > EPSILON) {
      const interest = investBalance * loanRate
      const paid = Math.min(installment, investBalance + interest)
      investBalance = Math.max(0, investBalance - Math.max(0, paid - interest))
      investInterest += interest
      investContribution += installment - paid
    } else {
      investContribution += installment
    }
    investPlacement += placementEarnings(investPlacement, placeRate, cap) + investContribution

    const repayNetWorth = repayPlacement - repayBalance
    const investNetWorth = investPlacement - investBalance

    rows.push({
      month,
      year: Math.ceil(month / 12),
      monthOfYear: ((month - 1) % 12) + 1,
      repayBalance,
      repayPlacement,
      repayNetWorth,
      investBalance,
      investPlacement,
      investNetWorth,
      delta: investNetWorth - repayNetWorth,
    })
  }

  let breakEvenMonth: number | null = null
  if (extra > 0) {
    for (const row of rows) {
      if (row.delta > EPSILON) {
        breakEvenMonth = row.month
        break
      }
    }
  }

  const last = rows.at(-1)

  return {
    rows,
    scheduledInstallment: installment,
    repaymentMonths,
    repayInterest,
    investInterest,
    repayFinal: last?.repayNetWorth ?? 0,
    investFinal: last?.investNetWorth ?? 0,
    breakEvenMonth,
  }
}

function finalDelta(input: InterestInput, rate: number): number {
  const valuation = valuate(input, rate)
  return valuation.investFinal - valuation.repayFinal
}

export function findIndifferenceRate(input: InterestInput): number | null {
  if (Math.max(0, input.monthlyAmount) <= 0 || Math.max(0, input.principal) <= 0) {
    return null
  }
  if (finalDelta(input, 0) >= 0) {
    return 0
  }
  if (finalDelta(input, MAX_INDIFFERENCE_RATE) <= 0) {
    return null
  }

  let low = 0
  let high = MAX_INDIFFERENCE_RATE

  for (let step = 0; step < BISECTION_STEPS; step += 1) {
    const mid = (low + high) / 2
    if (finalDelta(input, mid) < 0) {
      low = mid
    } else {
      high = mid
    }
  }

  return Math.round(((low + high) / 2) * 1000) / 1000
}

export function compareStrategies(input: InterestInput): InterestResult {
  const normalized = normalizeInterestInput(input)
  const valuation = valuate(normalized, normalized.placementRate)

  return {
    ...valuation,
    horizonMonths: effectiveHorizonMonths(normalized),
    indifferenceRate: findIndifferenceRate(normalized),
  }
}
